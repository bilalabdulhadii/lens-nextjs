"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type AlbumImage = {
    downloadURL: string;
};

type PublicAlbum = {
    id: string;
    title: string;
    description?: string;
    imagesCount?: number;
    images?: AlbumImage[];
    createdAt?: unknown;
    ownerId: string;
    ownerUsername?: string;
    ownerName?: string;
};

export default function PublicAlbumsPage() {
    const [albums, setAlbums] = useState<PublicAlbum[]>([]);
    const [loading, setLoading] = useState(true);

    const getMillis = (value: unknown) => {
        if (value && typeof value === "object") {
            const maybeToMillis = value as { toMillis?: () => number };
            if (typeof maybeToMillis.toMillis === "function") {
                return maybeToMillis.toMillis();
            }
            const maybeSeconds = value as { seconds?: number };
            if (typeof maybeSeconds.seconds === "number") {
                return maybeSeconds.seconds * 1000;
            }
        }
        return 0;
    };

    useEffect(() => {
        const q = query(
            collection(db, "albums"),
            where("privacy", "==", "public"),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: PublicAlbum[] = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<PublicAlbum, "id">),
                }))
                .filter(
                    (album) => (album.imagesCount ?? 0) > 0,
                );
            data.sort(
                (a, b) => getMillis(b.createdAt) - getMillis(a.createdAt),
            );
            setAlbums(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Public Albums
                </h1>
                <p className="text-sm text-muted-foreground">
                    Discover collections shared by the community.
                </p>
            </div>

            {loading && (
                <p className="text-sm text-muted-foreground">
                    Loading albums...
                </p>
            )}

            {!loading && albums.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
                    No public albums yet.
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => {
                    const cover = album.images?.[0]?.downloadURL;

                    return (
                        <Link
                            key={album.id}
                            href={`/albums/${album.id}`}
                            className="group block">
                            <Card className="overflow-hidden border-border/60 bg-card/80 transition hover:-translate-y-1 hover:shadow-xl">
                                <div className="relative h-40 w-full overflow-hidden bg-muted">
                                    {cover ? (
                                        <img
                                            src={cover}
                                            alt={album.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                            No cover yet
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                </div>
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-lg">
                                    {album.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {album.description || "No description."}
                                </CardDescription>
                                <p className="text-xs text-muted-foreground">
                                    By{" "}
                                    <span className="font-medium text-foreground">
                                        {album.ownerUsername || "User"}
                                    </span>
                                </p>
                            </CardHeader>
                                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{album.imagesCount ?? 0} images</span>
                                    <span className="rounded-full bg-muted/60 px-2 py-1">
                                        Public
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
