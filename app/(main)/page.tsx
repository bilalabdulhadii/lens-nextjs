import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12">
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm sm:p-12">
                <div className="absolute -left-24 -top-28 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
                <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div className="space-y-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                            Lens Studio
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                            Curate your albums in light, share them in
                            moments.
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Build public or private collections, then let the
                            community explore the stories behind every frame.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/albums">Browse albums</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/explore">Explore images</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="grid gap-4">
                            <div className="rounded-2xl border border-border/60 bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                                    Featured Album
                                </p>
                                <p className="mt-3 text-lg font-semibold">
                                    Midnight Frames
                                </p>
                                <p className="mt-2 text-sm text-white/70">
                                    18.9M photos · Public
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-emerald-100 via-emerald-50 to-white p-4 shadow-sm dark:from-emerald-500/20 dark:via-emerald-900/20 dark:to-background">
                                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                        New uploads
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
                                        120K
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/60 bg-linear-to-br from-blue-100 via-blue-50 to-white p-4 shadow-sm dark:from-blue-500/20 dark:via-blue-900/20 dark:to-background">
                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                        Public albums
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-blue-900 dark:text-blue-100">
                                        72K+
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-border/60 bg-card/80">
                    <CardHeader>
                        <CardTitle>Build your next story</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Collect up to five images per album, control
                            privacy, and keep your best work organized.
                        </p>
                        <Button asChild>
                            <Link href="/login">Create an album</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border/60 bg-linear-to-br from-foreground/5 via-background to-background">
                    <CardHeader>
                        <CardTitle>Explore the studio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Dive into a living gallery of public albums from
                            photographers around the world.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href="/explore">Open Explore</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
