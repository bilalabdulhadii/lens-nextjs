"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Album } from "@/types/album";

export default function AlbumsPage() {
    const { user } = useAuth();

    const [albums, setAlbums] = useState<Album[]>([]);
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
        if (!user) return;

        const q = query(
            collection(db, "albums"),
            where("ownerId", "==", user.uid),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Album[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Album, "id">),
            }));
            data.sort(
                (a, b) => getMillis(b.createdAt) - getMillis(a.createdAt),
            );
            setAlbums(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">My Albums</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your photos into collections.
                    </p>
                </div>

                <Link
                    href="/dashboard/albums/new"
                    className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
                    New Album
                </Link>
            </div>

            {loading && (
                <p className="text-sm text-muted-foreground">
                    Loading albums...
                </p>
            )}

            {!loading && albums.length === 0 && (
                <div className="border-border bg-card rounded-xl border p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        You don’t have any albums yet.
                    </p>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                    <Link
                        key={album.id}
                        href={`/dashboard/albums/${album.id}`}
                        className="border-border bg-card flex flex-col overflow-hidden rounded-xl border transition hover:shadow-md">
                        <div className="relative h-32 w-full overflow-hidden bg-muted">
                            {album.images?.[0]?.downloadURL ? (
                                <img
                                    src={album.images[0].downloadURL}
                                    alt={album.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-muted via-muted/60 to-primary/20 dark:from-muted/80 dark:via-muted/50 dark:to-primary/30" />
                            )}
                            <div
                                className={`absolute right-3 top-3 inline-flex items-center rounded-full border border-white/40 px-3 py-1 text-xs font-semibold shadow-sm ${
                                    album.privacy === "public"
                                        ? "bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-600 dark:text-emerald-50"
                                        : "bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-600 dark:text-amber-50"
                                }`}>
                                {album.privacy === "public" ? "Public" : "Private"}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 p-4">
                            <p className="text-sm font-medium truncate">
                                {album.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {album.imagesCount}/5 items
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
