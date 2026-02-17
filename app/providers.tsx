"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="lens-theme"
            value={{
                light: "light",
                dark: "dark",
            }}>
            <TooltipProvider>
                <AuthProvider>{children}</AuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}
