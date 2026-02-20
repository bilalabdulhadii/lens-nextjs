export type AlbumImage = {
    id: string;
    fileName?: string;
    storagePath?: string;
    downloadURL: string;
    contentType?: string;
    size?: number;
    createdAt?: number | unknown;
};

export type AlbumPrivacy = "private" | "public";

export type Album = {
    id?: string;
    ownerId: string;
    ownerUsername?: string;
    ownerName?: string;
    title: string;
    description?: string;
    privacy: AlbumPrivacy;
    imagesCount: number;
    images: AlbumImage[];
    createdAt?: unknown;
    updatedAt?: unknown;
};

export type ExploreAlbum = {
    title: string;
    ownerId: string;
    ownerName?: string;
    ownerUsername?: string;
    images?: AlbumImage[];
};

export type ExploreImage = AlbumImage & {
    albumId: string;
    albumTitle: string;
    ownerId: string;
    ownerName?: string;
    ownerUsername?: string;
};