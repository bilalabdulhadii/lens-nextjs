"use client";

import { useState } from "react";

type ImageUploadProps = {
    maxFiles: number;
    currentCount?: number;
    onFilesChange: (files: File[]) => void;
};

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({
    maxFiles,
    currentCount = 0,
    onFilesChange,
}: ImageUploadProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    function handleFiles(files: FileList | null) {
        if (!files) return;

        const newErrors: string[] = [];
        const validFiles: File[] = [];

        const availableSlots = maxFiles - currentCount - selectedFiles.length;

        if (availableSlots <= 0) {
            newErrors.push(`Maximum ${maxFiles} images reached.`);
            setErrors(newErrors);
            return;
        }

        Array.from(files).forEach((file) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                newErrors.push(`${file.name} has unsupported format.`);
                return;
            }

            if (file.size > MAX_SIZE) {
                newErrors.push(`${file.name} exceeds 5MB.`);
                return;
            }

            if (validFiles.length < availableSlots) {
                validFiles.push(file);
            }
        });

        const updatedFiles = [...selectedFiles, ...validFiles];

        setErrors(newErrors);
        setSelectedFiles(updatedFiles);
        onFilesChange(updatedFiles);
    }

    function removeFile(index: number) {
        const updated = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updated);
        onFilesChange(updated);
    }

    return (
        <div className="space-y-3">
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById("fileInput")?.click()}
                className="p-6 border-dashed border rounded-md text-center cursor-pointer hover:bg-muted/40">
                Drag & drop images or click to select
                <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                            <span className="truncate">{file.name}</span>
                            <button
                                type="button"
                                className="text-red-500 text-xs cursor-pointer"
                                onClick={() => removeFile(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {currentCount + selectedFiles.length}/{maxFiles} images used
            </p>

            {errors.length > 0 && (
                <div className="text-sm text-red-500 space-y-1">
                    {errors.map((err, i) => (
                        <p key={i}>{err}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
