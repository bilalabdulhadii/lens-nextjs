"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type Profile = {
    uid: string;
    username: string;
    fullName?: string;
};

type AlbumImage = {
    downloadURL: string;
};

type Album = {
    id: string;
    title: string;
    description?: string;
    privacy: "public" | "private";
    imagesCount?: number;
    images?: AlbumImage[];
    createdAt?: unknown;
};

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const normalizedUsername = useMemo(() => {
        if (!username) return "";
        return decodeURIComponent(username).toLowerCase();
    }, [username]);

    const { user, loading: authLoading } = useAuth();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [albumsLoading, setAlbumsLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    const isOwner = useMemo(() => {
        return !!user && !!profile && user.uid === profile.uid;
    }, [user, profile]);

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
        if (!normalizedUsername || authLoading) return;

        let alive = true;

        async function run() {
            setProfileLoading(true);
            setNotFoundState(false);

            try {
                const usernameSnap = await getDoc(
                    doc(db, "usernames", normalizedUsername),
                );

                if (!alive) return;

                if (usernameSnap.exists()) {
                    const { uid } = usernameSnap.data() as { uid: string };
                    let fullName: string | undefined;

                    try {
                        const userSnap = await getDoc(doc(db, "users", uid));
                        if (userSnap.exists()) {
                            const userData = userSnap.data() as {
                                fullName?: string;
                            };
                            fullName = userData.fullName;
                        }
                    } catch {
                        // Ignore profile fetch errors for guests.
                    }

                    if (!alive) return;

                    setProfile({
                        uid,
                        username: normalizedUsername,
                        fullName,
                    });
                    return;
                }

                const fallbackProfile = await resolveFromPublicAlbum();
                if (!alive) return;

                if (fallbackProfile) {
                    setProfile(fallbackProfile);
                } else {
                    setProfile(null);
                    setNotFoundState(true);
                }
            } catch {
                if (!alive) return;

                const fallbackProfile = await resolveFromPublicAlbum();
                if (!alive) return;

                if (fallbackProfile) {
                    setProfile(fallbackProfile);
                } else {
                    setProfile(null);
                    setNotFoundState(true);
                }
            } finally {
                if (alive) setProfileLoading(false);
            }
        }

        async function resolveFromPublicAlbum() {
            const publicAlbumsSnap = await getDocs(
                query(
                    collection(db, "albums"),
                    where("ownerUsername", "==", normalizedUsername),
                    where("privacy", "==", "public"),
                ),
            );

            if (publicAlbumsSnap.empty) {
                return null;
            }

            const albumData = publicAlbumsSnap.docs[0].data() as {
                ownerId: string;
                ownerName?: string;
                ownerUsername?: string;
            };

            return {
                uid: albumData.ownerId,
                username: albumData.ownerUsername || normalizedUsername,
                fullName: albumData.ownerName,
            };
        }

        run();
        return () => {
            alive = false;
        };
    }, [normalizedUsername, authLoading, user?.uid]);

    useEffect(() => {
        if (!profile || authLoading) return;

        const profileUid = profile.uid;
        let alive = true;

        async function run() {
            setAlbumsLoading(true);

            try {
                const base = collection(db, "albums");
                const q = isOwner
                    ? query(base, where("ownerId", "==", profileUid))
                    : query(
                          base,
                          where("ownerId", "==", profileUid),
                          where("privacy", "==", "public"),
                      );

                const snapshot = await getDocs(q);
                if (!alive) return;

                const data: Album[] = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<Album, "id">),
                }));

                data.sort(
                    (a, b) => getMillis(b.createdAt) - getMillis(a.createdAt),
                );

                setAlbums(data);
            } finally {
                if (alive) setAlbumsLoading(false);
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, [profile, isOwner, authLoading]);

    if (profileLoading || authLoading) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 py-10 text-sm text-muted-foreground">
                Loading profile...
            </div>
        );
    }

    if (notFoundState || !profile) {
        return notFound();
    }

    const totalAlbums = albums.length;
    const totalImages = albums.reduce(
        (sum, album) => sum + (album.imagesCount ?? 0),
        0,
    );
    const publicAlbums = albums.filter(
        (album) => album.privacy === "public",
    ).length;
    const privateAlbums = Math.max(0, totalAlbums - publicAlbums);

    const stats = isOwner
        ? [
              { label: "Albums", value: totalAlbums },
              { label: "Public", value: publicAlbums },
              { label: "Private", value: privateAlbums },
              { label: "Images", value: totalImages },
          ]
        : [
              { label: "Public albums", value: totalAlbums },
              { label: "Images", value: totalImages },
          ];

    const statsGridClass =
        stats.length > 2
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-2";

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {profile.fullName || profile.username}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        @{profile.username}
                    </p>
                </div>
            </div>

            <div className={`grid gap-4 ${statsGridClass}`}>
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/60">
                        <CardHeader className="pb-2">
                            <CardDescription>{stat.label}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-foreground">
                                {stat.value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div>
                <h2 className="text-xl font-semibold tracking-tight">
                    Albums
                </h2>
                <p className="text-sm text-muted-foreground">
                    {isOwner
                        ? "Your public and private collections."
                        : "Public collections shared by this user."}
                </p>
            </div>

            {albumsLoading && (
                <p className="text-sm text-muted-foreground">
                    Loading albums...
                </p>
            )}

            {!albumsLoading && albums.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
                    No albums to show.
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
                                        <div className="h-full w-full bg-gradient-to-br from-muted via-muted/60 to-primary/15" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                    {isOwner && (
                                        <div
                                            className={`absolute right-3 top-3 inline-flex items-center rounded-full border border-white/40 px-3 py-1 text-xs font-semibold shadow-sm ${
                                                album.privacy === "public"
                                                    ? "bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-600 dark:text-emerald-50"
                                                    : "bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-600 dark:text-amber-50"
                                            }`}>
                                            {album.privacy === "public"
                                                ? "Public"
                                                : "Private"}
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="space-y-2">
                                    <CardTitle className="text-lg">
                                        {album.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {album.description || "No description."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{album.imagesCount ?? 0} images</span>
                                    {!isOwner && (
                                        <span className="rounded-full bg-muted px-2 py-1">
                                            Public
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
