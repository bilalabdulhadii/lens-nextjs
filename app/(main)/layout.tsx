import Link from "next/link";

import { MainNavbar } from "@/components/main-navbar";
import { MainSearch } from "@/components/main-search";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const year = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/30">
            <div className="flex min-h-screen flex-col">
                <MainNavbar />

                <div className="mx-auto w-full max-w-6xl px-4 pt-6">
                    <MainSearch />
                </div>

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
                            <p className="text-xs">
                                © {year}{" "}
                                <span className="font-medium text-foreground">
                                    Bilal Abdulhadi
                                </span>
                                .{" "}
                                <a
                                    href="https://github.com/bilalabdulhadii"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline-offset-4 hover:underline">
                                    GitHub
                                </a>{" "}
                                ·{" "}
                                <a
                                    href="https://bilalabdulhadi.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline-offset-4 hover:underline">
                                    Website
                                </a>
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
                                    href="/about"
                                    className="hover:text-foreground">
                                    About
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
