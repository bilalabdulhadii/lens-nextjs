"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function MainNavbar() {
    const { user, loading } = useAuth();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/albums", label: "Albums" },
        { href: "/explore", label: "Explore" },
    ];

    return (
        <header className="border-b border-border/60 bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold">
                    <span className="relative h-10 w-10 overflow-hidden rounded-2xl shadow-sm">
                        <Image
                            src="/lens.svg"
                            alt="Lens logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="/lens_white.svg"
                            alt="Lens logo"
                            width={40}
                            height={40}
                            className="hidden h-10 w-10 object-contain dark:block"
                            priority
                        />
                    </span>
                    <span className="tracking-tight">Lens</span>
                </Link>

                <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                    {navLinks.map((item) => (
                        <Button key={item.href} variant="ghost" size="sm" asChild>
                            <Link href={item.href}>{item.label}</Link>
                        </Button>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {loading ? (
                        <Button size="sm" variant="outline" disabled>
                            Loading...
                        </Button>
                    ) : user ? (
                        <Button size="sm" asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/signup">Get started</Link>
                            </Button>
                        </>
                    )}
                </div>

                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="size-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col gap-6">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2">
                                {navLinks.map((item) => (
                                    <SheetClose key={item.href} asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                buttonVariants({
                                                    variant: "ghost",
                                                    size: "sm",
                                                }),
                                                "w-full justify-start",
                                            )}>
                                            {item.label}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2">
                                {loading ? (
                                    <Button size="sm" variant="outline" disabled>
                                        Loading...
                                    </Button>
                                ) : user ? (
                                    <SheetClose asChild>
                                        <Link
                                            href="/dashboard"
                                            className={cn(
                                                buttonVariants({
                                                    size: "sm",
                                                }),
                                                "w-full justify-start",
                                            )}>
                                            Dashboard
                                        </Link>
                                    </SheetClose>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Link
                                                href="/login"
                                                className={cn(
                                                    buttonVariants({
                                                        variant: "outline",
                                                        size: "sm",
                                                    }),
                                                    "w-full justify-start",
                                                )}>
                                                Login
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/signup"
                                                className={cn(
                                                    buttonVariants({
                                                        size: "sm",
                                                    }),
                                                    "w-full justify-start",
                                                )}>
                                                Get started
                                            </Link>
                                        </SheetClose>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
