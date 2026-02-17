export default function AlbumsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Albums</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your photos into collections.
                    </p>
                </div>
                <button
                    type="button"
                    className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
                    New Album
                </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="border-border bg-card flex h-40 flex-col justify-between rounded-xl border p-4">
                        <div className="bg-muted h-20 rounded-md" />
                        <div>
                            <p className="text-sm font-medium">
                                Album {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                5 items
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
