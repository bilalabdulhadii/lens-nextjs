"use client";

import * as React from "react";
import {
    Info,
    LayoutDashboard,
    GalleryVerticalEnd,
    Images,
    Compass,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useUserProfile } from "@/lib/use-user-profile";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { profile, loading } = useUserProfile();

    const userData = {
        name: loading
            ? "Loading..."
            : profile?.fullName || profile?.username || "User",
        email: profile?.email || "",
        avatar: "/avatars/default.jpg",
        username: profile?.username || "",
    };

    const data = {
        user: userData,
        navMain: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Studio",
                url: "/dashboard/studio",
                icon: Images,
            },
            {
                title: "Albums",
                url: "/dashboard/albums",
                icon: GalleryVerticalEnd,
            },
        ],
        navSecondary: [
            {
                title: "Explore",
                url: "/explore",
                icon: Compass,
            },
            {
                title: "About Lens",
                url: "/about",
                icon: Info,
            },
        ],
    };

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Image
                                        src="/lens.svg"
                                        alt="Lens logo"
                                        width={24}
                                        height={24}
                                        className="size-9 dark:hidden"
                                    />
                                    <Image
                                        src="/lens_white.svg"
                                        alt="Lens logo (dark)"
                                        width={24}
                                        height={24}
                                        className="size-9 hidden dark:block"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        Lens
                                    </span>
                                    <span className="truncate text-xs">
                                        Image Studio
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
