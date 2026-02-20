"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GalleryGrid } from "@/components/gallery-grid";
import { Button } from "@/components/ui/button";
import { Album } from "@/types/album";

export default function PublicAlbumPage() {
    const { id } = useParams<{ id: string }>();
    const { user, loading } = useAuth();

    const [album, setAlbum] = useState<Album | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    const isOwner = useMemo(() => {
        return !!user && !!album && user.uid === album.ownerId;
    }, [user, album]);

    useEffect(() => {
        let alive = true;

        async function run() {
            if (!id) return;

            setPageLoading(true);
            setNotFoundState(false);

            try {
                const snap = await getDoc(doc(db, "albums", id));
                if (!alive) return;

                if (!snap.exists()) {
                    setNotFoundState(true);
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
                setNotFoundState(true);
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

    if (pageLoading || loading) {
        return <div className="mx-auto w-full max-w-5xl p-6">Loading...</div>;
    }

    if (notFoundState || !album) {
        return notFound();
    }

    const canView = album.privacy === "public" || isOwner;
    if (!canView) {
        return notFound();
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {album.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {album.description || "No description."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        By{" "}
                        <span className="font-medium text-foreground">
                            {album.ownerUsername || "User"}
                        </span>
                    </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/albums">Back to albums</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Gallery</CardTitle>
                    <CardDescription>
                        {album.privacy === "public" ? "Public album" : "Private album"}
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
                            ownerName: album.ownerName,
                            ownerUsername: album.ownerUsername,
                        })}
                        emptyMessage="No images yet."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
