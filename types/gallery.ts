export type ImageInfo = {
    title?: string;
    size?: number;
    dimensions?: { width: number; height: number };
    albumTitle?: string;
    ownerName?: string;
    ownerUsername?: string;
};

export type GalleryImage<T = unknown> = {
    src: string;
    alt: string;
    original: T;
    info?: ImageInfo;
};

export type GalleryGridProps<T> = {
    images: T[];
    getSrc?: (image: T, index: number) => string | null | undefined;
    getAlt?: (image: T, index: number) => string | null | undefined;
    getInfo?: (image: T, index: number) => ImageInfo;
    title?: string;
    description?: string;
    showHeader?: boolean;
    emptyMessage?: string;
    className?: string;
    enableLightbox?: boolean;
    isDisabled?: (image: T, index: number) => boolean;
    renderOverlay?: (image: T, index: number) => React.ReactNode;
    layout?: "masonry" | "justified";
    rowHeight?: number;
    rowGap?: number;
};
