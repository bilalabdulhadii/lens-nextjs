"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PublicAlbum = {
    id: string;
    title: string;
    imagesCount?: number;
};

export function MainSearch({ className }: { className?: string }) {
    const [albums, setAlbums] = useState<PublicAlbum[]>([]);
    const [queryText, setQueryText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "albums"),
            where("privacy", "==", "public"),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: PublicAlbum[] = snapshot.docs.map((doc) => {
                const payload = doc.data() as Omit<PublicAlbum, "id">;
                return {
                    id: doc.id,
                    title: payload.title ?? "Untitled album",
                    imagesCount: payload.imagesCount ?? 0,
                };
            });
            setAlbums(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const results = useMemo(() => {
        const term = queryText.trim().toLowerCase();
        if (!term) return [];
        return albums
            .filter((album) => album.title.toLowerCase().includes(term))
            .slice(0, 6);
    }, [albums, queryText]);

    const showResults = queryText.trim().length > 0;

    return (
        <div className={cn("relative w-full", className)}>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/30">
                <Search className="size-4 text-muted-foreground" />
                <Input
                    value={queryText}
                    onChange={(event) => setQueryText(event.target.value)}
                    placeholder="Search public albums by title..."
                    className="h-8 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
            </div>

            {showResults && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border/60 bg-card/95 p-2 shadow-lg backdrop-blur">
                    {loading ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                            Searching...
                        </p>
                    ) : results.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                            No public albums found.
                        </p>
                    ) : (
                        <div className="flex flex-col">
                            {results.map((album) => (
                                <Link
                                    key={album.id}
                                    href={`/albums/${album.id}`}
                                    onClick={() => setQueryText("")}
                                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-muted/60">
                                    <span className="font-medium">
                                        {album.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {album.imagesCount ?? 0} images
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
