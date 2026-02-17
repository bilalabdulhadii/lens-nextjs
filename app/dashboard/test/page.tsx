import Link from "next/link";

export default function DashboardTestPage() {
    return (
        <div className="flex min-h-[60vh] flex-col gap-4 p-4">
            <h1 className="text-2xl font-semibold">Dashboard Test Page</h1>
            <p className="text-muted-foreground">
                If you can see the sidebar and this content, the dashboard
                layout is working.
            </p>
            <Link
                href="/dashboard"
                className="text-primary underline underline-offset-4">
                Back to dashboard
            </Link>
        </div>
    );
}
