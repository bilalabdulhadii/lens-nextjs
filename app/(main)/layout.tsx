import Link from "next/link";

import { MainNavbar } from "@/components/main-navbar";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
            <div className="flex min-h-screen flex-col">
                <MainNavbar />

                <main className="flex-1">{children}</main>

                <footer className="border-t border-border/60 bg-background/80 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-2 text-center md:text-left">
                            <div className="text-base font-semibold text-foreground">
                                Lens
                            </div>
                            <p className="text-xs leading-relaxed">
                                Curate your stories in light. Share public
                                albums and discover new perspectives.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-4 md:items-end">
                            <div className="flex flex-wrap justify-center gap-4 md:justify-end">
                                <Link
                                    href="/albums"
                                    className="hover:text-foreground">
                                    Albums
                                </Link>
                                <Link
                                    href="/explore"
                                    className="hover:text-foreground">
                                    Explore
                                </Link>
                                <Link
                                    href="/login"
                                    className="hover:text-foreground">
                                    Sign in
                                </Link>
                            </div>
                            <ThemeToggleButton compact />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
