import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                    404
                </p>
                <h1 className="mt-3 text-2xl font-semibold text-foreground">
                    Page not found
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The page you are looking for does not exist or is private.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button asChild>
                        <Link href="/">Go home</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/albums">Browse albums</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
