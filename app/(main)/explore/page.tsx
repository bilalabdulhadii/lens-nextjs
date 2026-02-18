"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GalleryGrid } from "@/components/gallery-grid";

type AlbumImage = {
    id: string;
    fileName?: string;
    downloadURL: string;
    contentType?: string;
    size?: number;
    createdAt?: unknown;
};

type Album = {
    title: string;
    ownerId: string;
    ownerName?: string;
    ownerUsername?: string;
    images?: AlbumImage[];
};

type ExploreImage = AlbumImage & {
    albumId: string;
    albumTitle: string;
    ownerId: string;
    ownerName?: string;
    ownerUsername?: string;
};

export default function ExplorePage() {
    const [images, setImages] = useState<ExploreImage[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const q = query(
            collection(db, "albums"),
            where("privacy", "==", "public"),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const collected: ExploreImage[] = [];

            snapshot.docs.forEach((doc) => {
                const data = doc.data() as Album;
                const albumImages = data.images ?? [];

                albumImages.forEach((image) => {
                    collected.push({
                        ...image,
                        albumId: doc.id,
                        albumTitle: data.title ?? "Untitled album",
                        ownerId: data.ownerId,
                        ownerName: data.ownerName,
                        ownerUsername: data.ownerUsername,
                    });
                });
            });

            setImages(collected);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Explore
                </h1>
                <p className="text-sm text-muted-foreground">
                    A curated stream of images from public albums.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground">
                    Loading images...
                </p>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Community Gallery
                        </CardTitle>
                        <CardDescription>
                            Only images from public albums are shown here.
                        </CardDescription>
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
                                ownerName: image.ownerUsername || "User",
                            })}
                            emptyMessage="No public images yet."
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
