"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Trash2, Undo2 } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GalleryGrid } from "@/components/gallery-grid";
import { ImageUpload } from "@/components/image-upload";
import { cn } from "@/lib/utils";

type AlbumImage = {
    id: string;
    fileName?: string;
    storagePath?: string;
    downloadURL: string;
    contentType?: string;
    size?: number;
    createdAt?: unknown;
};

const MAX_IMAGES = 5;

function makeId() {
    return crypto.randomUUID();
}

function getImageKey(image: AlbumImage) {
    return image.id ?? image.storagePath ?? image.downloadURL;
}

type Album = {
    ownerId: string;
    title: string;
    description?: string;
    privacy: "public" | "private";
    imagesCount: number;
    images: AlbumImage[];
};

export default function EditAlbumPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading } = useAuth();

    const [album, setAlbum] = useState<Album | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState<"public" | "private">("private");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [pendingRemoval, setPendingRemoval] = useState<string[]>([]);

    const isOwner = useMemo(() => {
        return !!user && !!album && user.uid === album.ownerId;
    }, [user, album]);

    useEffect(() => {
        let alive = true;

        async function run() {
            if (!id) return;

            setPageLoading(true);
            setNotFound(false);

            try {
                const snap = await getDoc(doc(db, "albums", id));
                if (!alive) return;

                if (!snap.exists()) {
                    setNotFound(true);
                    setAlbum(null);
                } else {
                    const data = snap.data() as Album;
                    setAlbum({
                        ...data,
                        images: data.images ?? [],
                        imagesCount: data.imagesCount ?? 0,
                    });
                }
            } catch {
                if (!alive) return;
                setNotFound(true);
                setAlbum(null);
            } finally {
                if (alive) setPageLoading(false);
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, [id]);

    useEffect(() => {
        if (!album) return;
        setTitle(album.title);
        setDescription(album.description ?? "");
        setPrivacy(album.privacy);
        setError("");
        setPendingRemoval([]);
        setNewFiles([]);
    }, [album]);

    const removedSet = useMemo(() => new Set(pendingRemoval), [pendingRemoval]);
    const activeImageCount = useMemo(() => {
        const images = album?.images ?? [];
        return images.filter((image) => !removedSet.has(getImageKey(image)))
            .length;
    }, [album, removedSet]);
    const remainingSlots = Math.max(
        0,
        MAX_IMAGES - (activeImageCount + newFiles.length),
    );

    if (pageLoading || loading) {
        return <div className="p-6">Loading album...</div>;
    }

    if (notFound || !album) {
        return <div className="p-6">Album not found.</div>;
    }

    if (!isOwner) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">
                    You don’t have permission to edit this album.
                </p>
                <div className="mt-4">
                    <Button asChild variant="secondary">
                        <Link href={`/dashboard/albums/${id}`}>
                            Back to album
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    async function handleSave() {
        if (!id || !album) return;

        setError("");

        if (!user) {
            setError("You must be logged in.");
            return;
        }

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError("Title is required.");
            return;
        }

        const removedSet = new Set(pendingRemoval);
        const keptImages = album.images.filter(
            (image) => !removedSet.has(getImageKey(image)),
        );

        if (keptImages.length + newFiles.length > MAX_IMAGES) {
            setError(`You can upload up to ${MAX_IMAGES} images total.`);
            return;
        }

        setSaving(true);
        try {
            const updates: Record<string, unknown> = {
                title: trimmedTitle,
                description: description.trim(),
                privacy,
                images: keptImages,
                imagesCount: keptImages.length,
                updatedAt: serverTimestamp(),
            };

            if (newFiles.length > 0) {
                const uploadedImages: AlbumImage[] = [];

                for (const file of newFiles) {
                    const imageId = makeId();
                    const safeName = file.name.replace(/\s+/g, "_");
                    const storagePath = `albums/${id}/${imageId}_${safeName}`;

                    const storageRef = ref(storage, storagePath);

                    await uploadBytes(storageRef, file, {
                        contentType: file.type,
                    });
                    const downloadURL = await getDownloadURL(storageRef);

                    uploadedImages.push({
                        id: imageId,
                        fileName: file.name,
                        storagePath,
                        downloadURL,
                        contentType: file.type,
                        size: file.size,
                        createdAt: Date.now(),
                    });
                }

                updates.images = [...keptImages, ...uploadedImages];
                updates.imagesCount = keptImages.length + uploadedImages.length;
            }

            await updateDoc(doc(db, "albums", id), updates);

            const removedImages = album.images.filter((image) =>
                removedSet.has(getImageKey(image)),
            );
            if (removedImages.length > 0) {
                await Promise.allSettled(
                    removedImages
                        .filter((image) => Boolean(image.storagePath))
                        .map((image) =>
                            deleteObject(ref(storage, image.storagePath!)),
                        ),
                );
            }

            router.push(`/dashboard/albums/${id}`);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to update album.";
            setError(message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Album</h1>
                    <p className="text-sm text-muted-foreground">
                        Update album details and add images.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="min-w-[140px]">
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={`/dashboard/albums/${id}`}>Back</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Album Details</CardTitle>
                    <CardDescription>
                        Set a title, description, and privacy.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-desc">Description</Label>
                            <Textarea
                                id="edit-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-privacy">Privacy</Label>
                            <select
                                id="edit-privacy"
                                value={privacy}
                                onChange={(e) =>
                                    setPrivacy(
                                        e.target.value as "public" | "private",
                                    )
                                }
                                disabled={saving}
                                className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Upload Images</Label>
                            <p className="text-xs text-muted-foreground">
                                {remainingSlots > 0
                                    ? `You can add up to ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}.`
                                    : "Maximum 5 images reached."}
                            </p>
                            <ImageUpload
                                maxFiles={MAX_IMAGES}
                                currentCount={activeImageCount}
                                onFilesChange={setNewFiles}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Album Images</CardTitle>
                    <CardDescription>
                        Preview the images currently in this album.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GalleryGrid
                        showHeader={false}
                        images={album.images}
                        getSrc={(image) => image.downloadURL}
                        getAlt={(image, index) =>
                            image.fileName ?? `${album.title} ${index + 1}`
                        }
                        getInfo={(image, index) => ({
                            title: image.fileName ?? `Image ${index + 1}`,
                            size: image.size,
                            albumTitle: album.title,
                        })}
                        isDisabled={(image) =>
                            removedSet.has(getImageKey(image))
                        }
                        renderOverlay={(image) => {
                            const isRemoved = removedSet.has(
                                getImageKey(image),
                            );
                            return (
                                <div className="pointer-events-none flex h-full w-full flex-col justify-between p-2">
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            size="icon-xs"
                                            variant="secondary"
                                            disabled={saving}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                const key = getImageKey(image);
                                                setPendingRemoval((prev) =>
                                                    prev.includes(key)
                                                        ? prev.filter(
                                                              (id) =>
                                                                  id !== key,
                                                          )
                                                        : [...prev, key],
                                                );
                                            }}
                                            className={cn(
                                                "pointer-events-auto rounded-full shadow-sm",
                                                isRemoved
                                                    ? "bg-emerald-500/90 text-white hover:bg-emerald-500/80"
                                                    : "bg-background/90 text-foreground hover:bg-background",
                                            )}>
                                            {isRemoved ? (
                                                <Undo2 className="size-3.5" />
                                            ) : (
                                                <Trash2 className="size-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                    {isRemoved && (
                                        <div className="rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white shadow-sm">
                                            Marked for removal
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                        emptyMessage="No images yet."
                    />

                </CardContent>
            </Card>
        </div>
    );
}
