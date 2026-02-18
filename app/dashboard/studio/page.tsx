"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryGrid } from "@/components/gallery-grid";

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
    title: string;
    images?: AlbumImage[];
};

type StudioImage = AlbumImage & {
    albumId: string;
    albumTitle: string;
};

export default function StudioPage() {
    const { user } = useAuth();

    const [images, setImages] = useState<StudioImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setImages([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "albums"),
            where("ownerId", "==", user.uid),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const collected: StudioImage[] = [];

            snapshot.docs.forEach((doc) => {
                const data = doc.data() as Album;
                const albumImages = data.images ?? [];

                albumImages.forEach((image) => {
                    collected.push({
                        ...image,
                        albumId: doc.id,
                        albumTitle: data.title ?? "Untitled album",
                    });
                });
            });

            setImages(collected);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Studio</h1>
                    <p className="text-sm text-muted-foreground">
                        Browse all images across your albums.
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground">
                    Loading images...
                </p>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Album Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GalleryGrid
                            showHeader={false}
                            images={images}
                            getSrc={(image) => image.downloadURL}
                            getAlt={(image, index) =>
                                image.fileName ??
                                `${image.albumTitle} ${index + 1}`
                            }
                            getInfo={(image, index) => ({
                                title: image.fileName ?? `Image ${index + 1}`,
                                size: image.size,
                                albumTitle: image.albumTitle,
                            })}
                            emptyMessage="No images yet."
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
