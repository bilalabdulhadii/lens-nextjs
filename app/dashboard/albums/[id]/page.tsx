"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery-grid";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type AlbumImage = {
    id: string;
    fileName?: string;
    storagePath?: string;
    downloadURL: string;
    contentType?: string;
    size?: number;
    createdAt?: unknown;
};

type Album = {
    ownerId: string;
    title: string;
    description?: string;
    privacy: "public" | "private";
    imagesCount: number;
    images: AlbumImage[];
};

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading } = useAuth();

    const [album, setAlbum] = useState<Album | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetImage, setTargetImage] = useState<AlbumImage | null>(null);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState("");
    const [deleteAlbumOpen, setDeleteAlbumOpen] = useState(false);
    const [deletingAlbum, setDeletingAlbum] = useState(false);
    const [deleteAlbumError, setDeleteAlbumError] = useState("");

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

    if (pageLoading || loading) return <div className="p-6">Loading album...</div>;
    if (notFound || !album) return <div className="p-6">Album not found.</div>;

    function getImageKey(image: AlbumImage) {
        return image.id ?? image.storagePath ?? image.downloadURL;
    }

    function openRemoveConfirm(image: AlbumImage) {
        setRemoveError("");
        setTargetImage(image);
        setConfirmOpen(true);
    }

    async function handleRemoveConfirmed() {
        if (!id || !album || !targetImage || !isOwner) return;
        setRemoveError("");
        setRemoving(true);

        const key = getImageKey(targetImage);
        const updatedImages = album.images.filter(
            (image) => getImageKey(image) !== key,
        );

        try {
            await updateDoc(doc(db, "albums", id), {
                images: updatedImages,
                imagesCount: updatedImages.length,
                updatedAt: serverTimestamp(),
            });

            if (targetImage.storagePath) {
                try {
                    await deleteObject(ref(storage, targetImage.storagePath));
                } catch {
                    setRemoveError(
                        "Removed from album, but storage deletion failed.",
                    );
                }
            }

            setAlbum({
                ...album,
                images: updatedImages,
                imagesCount: updatedImages.length,
            });
            setConfirmOpen(false);
            setTargetImage(null);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to remove image.";
            setRemoveError(message);
        } finally {
            setRemoving(false);
        }
    }

    async function handleDeleteAlbum() {
        if (!id || !album || !isOwner) return;
        setDeleteAlbumError("");
        setDeletingAlbum(true);

        try {
            if (album.images.length > 0) {
                const deletions = await Promise.allSettled(
                    album.images
                        .filter((image) => Boolean(image.storagePath))
                        .map((image) =>
                            deleteObject(ref(storage, image.storagePath!)),
                        ),
                );

                const failed = deletions.filter(
                    (result) => result.status === "rejected",
                );
                if (failed.length > 0) {
                    setDeleteAlbumError(
                        "Some images could not be removed from storage.",
                    );
                    return;
                }
            }

            await deleteDoc(doc(db, "albums", id));
            router.push("/dashboard/albums");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to delete album.";
            setDeleteAlbumError(message);
        } finally {
            setDeletingAlbum(false);
        }
    }

    return (
        <div className="space-y-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3">
                        <span className="truncate">{album.title}</span>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {album.privacy.toUpperCase()} • {album.imagesCount}
                                /5
                            </span>

                            {isOwner && (
                                <>
                                    <Button size="sm" variant="secondary" asChild>
                                        <Link href={`/dashboard/albums/${id}/edit`}>
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeleteAlbumOpen(true)}
                                        disabled={deletingAlbum}>
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                    {album.description ? (
                        <p className="text-sm text-muted-foreground">
                            {album.description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No description.
                        </p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Gallery</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Click any image to view full size.
                    </p>
                </CardHeader>
                <CardContent>
                    {removeError && (
                        <p className="mb-3 text-sm text-red-500">
                            {removeError}
                        </p>
                    )}
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
                        renderOverlay={
                            isOwner
                                ? (image) => (
                                      <div className="pointer-events-none flex h-full w-full items-start justify-end p-2">
                                          <Button
                                              type="button"
                                              size="icon-xs"
                                              variant="secondary"
                                              disabled={removing}
                                              onClick={(event) => {
                                                  event.stopPropagation();
                                                  openRemoveConfirm(image);
                                              }}
                                              className="pointer-events-auto rounded-full bg-destructive/90 text-white hover:bg-destructive">
                                              <Trash2 className="size-3.5" />
                                          </Button>
                                      </div>
                                  )
                                : undefined
                        }
                        emptyMessage="No images yet."
                    />
                </CardContent>
            </Card>

            <Dialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    setConfirmOpen(open);
                    if (!open) setTargetImage(null);
                }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove image?</DialogTitle>
                        <DialogDescription>
                            {targetImage?.fileName
                                ? `This will permanently delete "${targetImage.fileName}".`
                                : "This will permanently delete this image."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setConfirmOpen(false)}
                            disabled={removing}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRemoveConfirmed}
                            disabled={removing}>
                            {removing ? "Removing..." : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteAlbumOpen}
                onOpenChange={(open) => {
                    setDeleteAlbumOpen(open);
                    if (!open) setDeleteAlbumError("");
                }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete album?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete “{album.title}” and all
                            its images.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteAlbumError && (
                        <p className="text-sm text-red-500">
                            {deleteAlbumError}
                        </p>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setDeleteAlbumOpen(false)}
                            disabled={deletingAlbum}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteAlbum}
                            disabled={deletingAlbum}>
                            {deletingAlbum ? "Deleting..." : "Delete album"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
