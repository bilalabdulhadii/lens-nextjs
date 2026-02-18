import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">About Lens</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Lens is a lightweight studio for organizing and sharing
                    photo albums.
                </p>
            </div>

            <Card className="border-border/60 bg-card/80">
                <CardHeader>
                    <CardTitle className="text-lg">What you can do</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Create albums, keep them private, or share publicly.</p>
                    <p>Browse public collections and explore new work.</p>
                    <p>Stay focused on the images and the story behind them.</p>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
                <Button asChild>
                    <Link href="/albums">Browse albums</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/explore">Explore images</Link>
                </Button>
            </div>
        </div>
    );
}
