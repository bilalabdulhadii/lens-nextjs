"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Album = {
    imagesCount?: number;
};

export default function Page() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [albumCount, setAlbumCount] = useState(0);
    const [imageCount, setImageCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setAlbumCount(0);
            setImageCount(0);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "albums"),
            where("ownerId", "==", user.uid),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const albums = snapshot.docs.map(
                (doc) => doc.data() as Album,
            );
            const totalImages = albums.reduce(
                (sum, album) => sum + (album.imagesCount ?? 0),
                0,
            );
            setAlbumCount(albums.length);
            setImageCount(totalImages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Quick overview of your library.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Albums
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">
                                {albumCount}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">
                                {imageCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
