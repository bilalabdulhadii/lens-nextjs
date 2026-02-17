import type { CSSProperties } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/guards/auth-guard";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as CSSProperties
                }>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2 py-10">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}
