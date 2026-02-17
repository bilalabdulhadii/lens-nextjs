import Link from "next/link";

export default function DashboardNotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">404</p>
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-sm text-muted-foreground">
                The dashboard page you’re looking for doesn’t exist.
            </p>
            <Link
                href="/dashboard"
                className="text-primary underline underline-offset-4">
                Back to dashboard
            </Link>
        </div>
    );
}
