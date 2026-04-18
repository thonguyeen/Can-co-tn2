'use client';

export interface ConvertResult {
    blob: Blob;
    preview: string;       // Object URL for preview
    originalSize: number;  // bytes
    convertedSize: number; // bytes
    saving: number;        // % saved (0-100)
}

interface ConvertOptions {
    maxWidth?: number;   // default: 1080
    quality?: number;    // default: 0.82 (82%)
    maxSizeBytes?: number; // default: 5MB
}

const DEFAULT_OPTIONS: Required<ConvertOptions> = {
    maxWidth: 1080,
    quality: 0.82,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
};

/**
 * Convert an image File to WebP format using Canvas API.
 * - If the file exceeds maxSizeBytes → throws error
 * - If the file is tiny (< 50KB) → skips conversion, returns as-is
 * - If browser doesn't support WebP canvas → falls back to original file
 * - Resizes image to maxWidth if width exceeds it (preserving aspect ratio)
 */
export async function convertToWebP(
    file: File,
    options?: ConvertOptions,
): Promise<ConvertResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Reject files over size limit
    if (file.size > opts.maxSizeBytes) {
        throw new Error(`Ảnh quá lớn (tối đa ${Math.round(opts.maxSizeBytes / 1024 / 1024)}MB)`);
    }

    // Skip conversion for tiny images (not worth it)
    if (file.size < 50 * 1024) {
        const preview = URL.createObjectURL(file);
        return {
            blob: file,
            preview,
            originalSize: file.size,
            convertedSize: file.size,
            saving: 0,
        };
    }

    try {
        // Decode image
        const bitmap = await createImageBitmap(file);

        // Calculate output dimensions
        let { width, height } = bitmap;
        if (width > opts.maxWidth) {
            const ratio = opts.maxWidth / width;
            width = opts.maxWidth;
            height = Math.round(height * ratio);
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        // Export as WebP
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/webp', opts.quality),
        );

        // Fallback: if browser returned null or doesn't support WebP output
        if (!blob) {
            const fallback = file as unknown as Blob;
            const preview = URL.createObjectURL(fallback);
            return {
                blob: fallback,
                preview,
                originalSize: file.size,
                convertedSize: file.size,
                saving: 0,
            };
        }

        // If converted output is larger than original (rare), keep original
        const finalBlob = blob.size < file.size ? blob : (file as unknown as Blob);
        const finalSize = finalBlob.size;
        const saving = Math.round((1 - finalSize / file.size) * 100);
        const preview = URL.createObjectURL(finalBlob);

        return {
            blob: finalBlob,
            preview,
            originalSize: file.size,
            convertedSize: finalSize,
            saving: Math.max(0, saving),
        };
    } catch {
        // Any error → fallback to original
        const preview = URL.createObjectURL(file);
        return {
            blob: file as unknown as Blob,
            preview,
            originalSize: file.size,
            convertedSize: file.size,
            saving: 0,
        };
    }
}

/** Format bytes into human-readable string: 1234567 → "1.2 MB" */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
