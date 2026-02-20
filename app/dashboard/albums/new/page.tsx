"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    increment,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { AlbumImage, AlbumPrivacy } from "@/types/album";

const MAX_IMAGES = 5;

function makeId() {
    return crypto.randomUUID();
}

export default function NewAlbumPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState<AlbumPrivacy>("private");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [newFiles, setNewFiles] = useState<File[]>([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (loading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const profileSnap = await getDoc(doc(db, "users", user.uid));
        const profile = profileSnap.exists()
            ? (profileSnap.data() as { username?: string; fullName?: string })
            : null;
        const ownerUsername = profile?.username ?? "";
        const ownerName = profile?.fullName ?? "";

        const trimmed = title.trim();
        if (!trimmed) {
            setError("Title is required.");
            return;
        }

        if (newFiles.length > MAX_IMAGES) {
            setError(`You can upload up to ${MAX_IMAGES} images.`);
            return;
        }
        
        setSubmitting(true);
        try {
            // 1) create album
            const docRef = await addDoc(collection(db, "albums"), {
                ownerId: user.uid,
                ownerName,
                ownerUsername,
                title: trimmed,
                description: description.trim(),
                privacy,
                images: [],
                imagesCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 2) upload selected files (if any)
            if (newFiles.length > 0) {
                const uploadedImages: AlbumImage[] = [];

                for (const file of newFiles) {
                    const imageId = makeId();
                    const safeName = file.name.replace(/\s+/g, "_");
                    const storagePath = `albums/${docRef.id}/${imageId}_${safeName}`;

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

                // 3) update album doc with images + count
                await updateDoc(doc(db, "albums", docRef.id), {
                    images: arrayUnion(...uploadedImages),
                    imagesCount: increment(uploadedImages.length),
                    updatedAt: serverTimestamp(),
                });
            }

            // 4) go to album page
            router.push(`/dashboard/albums/${docRef.id}`);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to create album.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div>
                <h1 className="text-2xl font-semibold">New Album</h1>
                <p className="text-sm text-muted-foreground">
                    Create a new album to organize your photos.
                </p>
            </div>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-base">Album Details</CardTitle>
                    <CardDescription>
                        Set a title, description, and privacy.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Album title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Optional description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="privacy">Privacy</Label>
                            <select
                                id="privacy"
                                name="privacy"
                                value={privacy}
                                onChange={(e) =>
                                    setPrivacy(e.target.value as AlbumPrivacy)
                                }
                                disabled={submitting}
                                className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <ImageUpload
                                maxFiles={MAX_IMAGES}
                                currentCount={0}
                                onFilesChange={setNewFiles}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit">
                                {submitting ? "Creating..." : "Create Album"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
