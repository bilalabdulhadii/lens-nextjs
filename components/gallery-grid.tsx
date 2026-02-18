"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent,
    type ReactNode,
} from "react";
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryImage<T = unknown> = {
    src: string;
    alt: string;
    original: T;
    info?: ImageInfo;
};

type ImageInfo = {
    title?: string;
    size?: number;
    dimensions?: { width: number; height: number };
    albumTitle?: string;
    ownerName?: string;
    ownerUsername?: string;
};

type GalleryGridProps<T> = {
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
    renderOverlay?: (image: T, index: number) => ReactNode;
    layout?: "masonry" | "justified";
    rowHeight?: number;
    rowGap?: number;
};

function defaultGetSrc(image: unknown): string | null {
    if (typeof image === "string") return image;
    if (!image || typeof image !== "object") return null;

    if ("downloadURL" in image && typeof image.downloadURL === "string") {
        return image.downloadURL;
    }
    if ("src" in image && typeof image.src === "string") {
        return image.src;
    }
    if ("url" in image && typeof image.url === "string") {
        return image.url;
    }

    return null;
}

function defaultGetAlt(
    image: unknown,
    index: number,
    title?: string,
): string {
    if (image && typeof image === "object") {
        if ("alt" in image && typeof image.alt === "string") {
            return image.alt;
        }
        if ("fileName" in image && typeof image.fileName === "string") {
            return image.fileName;
        }
        if ("name" in image && typeof image.name === "string") {
            return image.name;
        }
    }

    return title ? `${title} ${index + 1}` : `Image ${index + 1}`;
}

function normalizeImages<T>(
    images: T[],
    title: string | undefined,
    getSrc?: (image: T, index: number) => string | null | undefined,
    getAlt?: (image: T, index: number) => string | null | undefined,
    getInfo?: (image: T, index: number) => ImageInfo,
): GalleryImage<T>[] {
    const resolveSrc = getSrc ?? ((image: T) => defaultGetSrc(image));
    const resolveAlt =
        getAlt ??
        ((image: T, index: number) => defaultGetAlt(image, index, title));

    return images
        .map((image, index) => {
            const src = resolveSrc(image, index);
            if (!src) return null;
            const alt = resolveAlt(image, index) ?? defaultGetAlt(image, index, title);
            const info = getInfo?.(image, index);
            return { src, alt, original: image, info };
        })
        .filter((item): item is GalleryImage<T> => Boolean(item));
}

type LightboxProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    images: GalleryImage[];
    index: number;
    onIndexChange: (index: number) => void;
    title?: string;
};

function formatBytes(size?: number) {
    if (!size || size <= 0) return null;
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
}

function ImageLightbox({
    open,
    onOpenChange,
    images,
    index,
    onIndexChange,
    title,
}: LightboxProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dimensionsBySrc, setDimensionsBySrc] = useState<
        Record<string, { width: number; height: number }>
    >({});
    const dragStart = useRef({ x: 0, y: 0 });

    const current = images[index];
    const canGoPrev = index > 0;
    const canGoNext = index < images.length - 1;
    const currentInfo = current?.info;
    const measuredDims = current ? dimensionsBySrc[current.src] : undefined;
    const dimensions =
        currentInfo?.dimensions ??
        measuredDims ??
        (current
            ? dimensionsBySrc[current.src]
            : undefined);
    const formattedSize = formatBytes(currentInfo?.size);
    const titleText = currentInfo?.title ?? current?.alt ?? title ?? "Image";
    const ownerUsername = currentInfo?.ownerUsername?.trim();
    const ownerName = currentInfo?.ownerName?.trim();

    useEffect(() => {
        if (!open) return;
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
    }, [open, index]);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "ArrowLeft" && canGoPrev) {
                onIndexChange(index - 1);
            }
            if (event.key === "ArrowRight" && canGoNext) {
                onIndexChange(index + 1);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, index, canGoPrev, canGoNext, onIndexChange]);

    function handleZoomIn() {
        setScale((prev) => Math.min(prev + 0.5, 4));
    }

    function handleZoomOut() {
        setScale((prev) => Math.max(prev - 0.5, 1));
    }

    function handleReset() {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }

    function handlePointerDown(event: PointerEvent<HTMLImageElement>) {
        if (scale <= 1) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
        dragStart.current = {
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        };
    }

    function handlePointerMove(event: PointerEvent<HTMLImageElement>) {
        if (!isDragging || scale <= 1) return;
        event.preventDefault();
        setPosition({
            x: event.clientX - dragStart.current.x,
            y: event.clientY - dragStart.current.y,
        });
    }

    function handlePointerUp(event: PointerEvent<HTMLImageElement>) {
        if (!isDragging) return;
        event.preventDefault();
        event.currentTarget.releasePointerCapture(event.pointerId);
        setIsDragging(false);
    }

    if (!current) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="border-0 bg-transparent p-0 shadow-none sm:max-w-5xl">
                <DialogTitle className="sr-only">
                    {title ? `${title} image preview` : "Image preview"}
                </DialogTitle>
                <div className="relative flex h-[80vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-black/50">
                    {canGoPrev && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onIndexChange(index - 1)}
                            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 text-slate-900 shadow-lg shadow-black/20 ring-1 ring-white/70 transition hover:bg-white">
                            <ChevronLeft className="size-5" />
                        </Button>
                    )}

                    {canGoNext && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onIndexChange(index + 1)}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 text-slate-900 shadow-lg shadow-black/20 ring-1 ring-white/70 transition hover:bg-white">
                            <ChevronRight className="size-5" />
                        </Button>
                    )}

                    <img
                        src={current.src}
                        alt={current.alt ?? title ?? "Gallery image"}
                        draggable={false}
                        onLoad={(event) => {
                            const { naturalWidth, naturalHeight } =
                                event.currentTarget;
                            if (!naturalWidth || !naturalHeight) return;
                            setDimensionsBySrc((prev) => ({
                                ...prev,
                                [current.src]: {
                                    width: naturalWidth,
                                    height: naturalHeight,
                                },
                            }));
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className={cn(
                            "max-h-[78vh] w-auto select-none rounded-xl object-contain shadow-2xl",
                            scale > 1 ? "cursor-grab" : "cursor-default",
                            isDragging ? "cursor-grabbing" : "",
                        )}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? "none" : "transform 0.3s ease",
                        }}
                        onClick={(event) => event.stopPropagation()}
                    />

                    <div className="pointer-events-auto absolute left-4 top-4 max-w-[70%] rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-white shadow-lg backdrop-blur">
                        <div className="text-sm font-semibold">
                            {titleText}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                            {formattedSize && <span>{formattedSize}</span>}
                            {dimensions && (
                                <span>
                                    {dimensions.width}×{dimensions.height}
                                </span>
                            )}
                            {currentInfo?.albumTitle && (
                                <span>Album: {currentInfo.albumTitle}</span>
                            )}
                            {ownerUsername ? (
                                <span>
                                    By{" "}
                                    <Link
                                        href={`/${ownerUsername}`}
                                        className="font-semibold text-white hover:underline"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }>
                                        {ownerUsername}
                                    </Link>
                                </span>
                            ) : (
                                ownerName && <span>By {ownerName}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-xs text-white shadow-lg backdrop-blur">
                    <span className="pointer-events-none text-xs text-white/80">
                        {index + 1} / {images.length}
                    </span>
                    <div className="pointer-events-auto flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleZoomOut}
                            disabled={scale <= 1}
                            className="rounded-full text-white hover:bg-white/15 hover:text-white">
                            <ZoomOut className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleReset}
                            className="rounded-full text-white hover:bg-white/15 hover:text-white">
                            <RotateCcw className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleZoomIn}
                            disabled={scale >= 4}
                            className="rounded-full text-white hover:bg-white/15 hover:text-white">
                            <ZoomIn className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full text-white hover:bg-white/15 hover:text-white">
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function GalleryGrid<T>({
    images,
    getSrc,
    getAlt,
    getInfo,
    title = "Gallery",
    description,
    showHeader = true,
    emptyMessage = "No images yet.",
    className,
    enableLightbox = true,
    isDisabled,
    renderOverlay,
    layout = "justified",
    rowHeight = 220,
    rowGap = 16,
}: GalleryGridProps<T>) {
    const normalized = useMemo(
        () => normalizeImages(images, title, getSrc, getAlt, getInfo),
        [images, title, getSrc, getAlt, getInfo],
    );

    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [dimensionsBySrc, setDimensionsBySrc] = useState<
        Record<string, { width: number; height: number }>
    >({});

    function openAt(nextIndex: number) {
        setIndex(nextIndex);
        setOpen(true);
    }

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const missing = normalized.filter(
            (image) => !dimensionsBySrc[image.src],
        );
        if (missing.length === 0) return;

        let cancelled = false;

        missing.forEach((image) => {
            const loader = new Image();
            loader.src = image.src;
            loader.onload = () => {
                if (cancelled) return;
                if (!loader.naturalWidth || !loader.naturalHeight) return;
                setDimensionsBySrc((prev) =>
                    prev[image.src]
                        ? prev
                        : {
                              ...prev,
                              [image.src]: {
                                  width: loader.naturalWidth,
                                  height: loader.naturalHeight,
                              },
                          },
                );
            };
        });

        return () => {
            cancelled = true;
        };
    }, [normalized, dimensionsBySrc]);

    const rows = useMemo(() => {
        if (layout !== "justified" || containerWidth <= 0) return [];

        const computedRows: Array<{
            items: Array<{ image: GalleryImage<T>; ratio: number }>;
            height: number;
        }> = [];

        let row: Array<{ image: GalleryImage<T>; ratio: number }> = [];
        let ratioSum = 0;

        normalized.forEach((image) => {
            const infoDims = image.info?.dimensions;
            const cachedDims = dimensionsBySrc[image.src];
            const dims = infoDims ?? cachedDims;
            const ratio = dims ? dims.width / dims.height : 4 / 3;

            row.push({ image, ratio });
            ratioSum += ratio;

            const rowWidth = ratioSum * rowHeight + rowGap * (row.length - 1);
            if (rowWidth >= containerWidth) {
                const height =
                    (containerWidth - rowGap * (row.length - 1)) / ratioSum;
                computedRows.push({ items: row, height });
                row = [];
                ratioSum = 0;
            }
        });

        if (row.length > 0) {
            computedRows.push({ items: row, height: rowHeight });
        }

        return computedRows;
    }, [
        layout,
        containerWidth,
        normalized,
        dimensionsBySrc,
        rowHeight,
        rowGap,
    ]);

    return (
        <div className={cn("space-y-4", className)}>
            {showHeader && (
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {normalized.length} images
                    </span>
                </div>
            )}

            {normalized.length > 0 ? (
                <div
                    ref={containerRef}
                    className={cn(
                        layout === "masonry"
                            ? "gallery-masonry"
                            : "space-y-4",
                    )}>
                    {layout === "masonry"
                        ? normalized.map((image, imageIndex) => {
                              const disabled =
                                  isDisabled?.(image.original, imageIndex) ??
                                  false;
                              const overlay = renderOverlay?.(
                                  image.original,
                                  imageIndex,
                              );

                              return (
                                  <div
                                      key={`${image.src}-${imageIndex}`}
                                      role="button"
                                      tabIndex={
                                          enableLightbox && !disabled ? 0 : -1
                                      }
                                      data-disabled={disabled}
                                      className={cn(
                                          "gallery-item masonry-item group relative w-full border border-border/60 bg-card/70 text-left transition-shadow duration-300 hover:shadow-2xl",
                                          disabled
                                              ? "cursor-not-allowed opacity-60 grayscale"
                                              : "cursor-zoom-in",
                                      )}
                                      onClick={() => {
                                          if (!enableLightbox || disabled) return;
                                          openAt(imageIndex);
                                      }}
                                      onKeyDown={(event) => {
                                          if (!enableLightbox || disabled) return;
                                          if (
                                              event.key === "Enter" ||
                                              event.key === " "
                                          ) {
                                              event.preventDefault();
                                              openAt(imageIndex);
                                          }
                                      }}
                                      aria-label={`Open image ${imageIndex + 1}`}
                                      aria-disabled={disabled}>
                                      <img
                                          src={image.src}
                                          alt={image.alt}
                                          loading="lazy"
                                      />
                                      {overlay && (
                                          <div className="pointer-events-none absolute inset-0 z-10">
                                              {overlay}
                                          </div>
                                      )}
                                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/0 via-transparent to-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  </div>
                              );
                          })
                        : rows.map((row, rowIndex) => (
                              <div
                                  key={`row-${rowIndex}`}
                                  className="flex flex-nowrap items-center"
                                  style={{ gap: rowGap }}>
                                  {row.items.map((item, colIndex) => {
                                      const imageIndex = normalized.indexOf(
                                          item.image,
                                      );
                                      const disabled =
                                          isDisabled?.(
                                              item.image.original,
                                              imageIndex,
                                          ) ?? false;
                                      const overlay = renderOverlay?.(
                                          item.image.original,
                                          imageIndex,
                                      );

                                      return (
                                          <div
                                              key={`${item.image.src}-${colIndex}`}
                                              role="button"
                                              tabIndex={
                                                  enableLightbox && !disabled
                                                      ? 0
                                                      : -1
                                              }
                                              data-disabled={disabled}
                                              className={cn(
                                                  "gallery-item group relative border border-border/60 bg-card/70 text-left transition-shadow duration-300 hover:shadow-2xl",
                                                  disabled
                                                      ? "cursor-not-allowed opacity-60 grayscale"
                                                      : "cursor-zoom-in",
                                              )}
                                              style={{
                                                  width:
                                                      item.ratio * row.height,
                                                  height: row.height,
                                              }}
                                              onClick={() => {
                                                  if (!enableLightbox || disabled)
                                                      return;
                                                  openAt(imageIndex);
                                              }}
                                              onKeyDown={(event) => {
                                                  if (!enableLightbox || disabled)
                                                      return;
                                                  if (
                                                      event.key === "Enter" ||
                                                      event.key === " "
                                                  ) {
                                                      event.preventDefault();
                                                      openAt(imageIndex);
                                                  }
                                              }}
                                              aria-label={`Open image ${imageIndex + 1}`}
                                              aria-disabled={disabled}>
                                              <img
                                                  src={item.image.src}
                                                  alt={item.image.alt}
                                                  loading="lazy"
                                                  className="h-full w-full object-cover"
                                              />
                                              {overlay && (
                                                  <div className="pointer-events-none absolute inset-0 z-10">
                                                      {overlay}
                                                  </div>
                                              )}
                                              <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/0 via-transparent to-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                          </div>
                                      );
                                  })}
                              </div>
                          ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                    {emptyMessage}
                </div>
            )}

            {enableLightbox && normalized.length > 0 && (
                <ImageLightbox
                    open={open}
                    onOpenChange={setOpen}
                    images={normalized}
                    index={index}
                    onIndexChange={setIndex}
                    title={title}
                />
            )}
        </div>
    );
}
