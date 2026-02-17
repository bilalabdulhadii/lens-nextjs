"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

type ThemeToggleButtonProps = {
    compact?: boolean;
};

export function ThemeToggleButton({ compact = false }: ThemeToggleButtonProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="outline"
            size={compact ? "icon" : "sm"}
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={
                compact ? "h-8 w-8 cursor-pointer" : "gap-2 cursor-pointer"
            }>
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
            {compact ? null : isDark ? "Light" : "Dark"}
        </Button>
    );
}
