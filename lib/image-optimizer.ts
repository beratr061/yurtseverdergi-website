/**
 * Image Optimization Utilities
 * 
 * Bu dosya görsellerin optimize edilmesi için yardımcı fonksiyonlar içerir.
 * - WebP formatına dönüştürme
 * - Boyut sınırlaması (max 1MB)
 * - Kalite optimizasyonu
 */

export interface ImageOptimizationOptions {
    maxSizeMB?: number;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
    maxSizeMB: 1, // 1MB
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'webp',
};

/**
 * Görseli optimize et
 */
export async function optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
): Promise<Blob> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Canvas oluştur
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Boyutları hesapla (aspect ratio koru)
                let { width, height } = img;

                if (width > opts.maxWidth! || height > opts.maxHeight!) {
                    const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                // Görseli çiz
                ctx.drawImage(img, 0, 0, width, height);

                // WebP olarak export et
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to create blob'));
                            return;
                        }

                        // Boyut kontrolü
                        const sizeMB = blob.size / (1024 * 1024);

                        if (sizeMB > opts.maxSizeMB!) {
                            // Kaliteyi düşür ve tekrar dene
                            const newQuality = Math.max(opts.quality! - 10, 60);

                            if (newQuality < opts.quality!) {
                                optimizeImage(file, { ...opts, quality: newQuality })
                                    .then(resolve)
                                    .catch(reject);
                            } else {
                                reject(new Error(`Image size (${sizeMB.toFixed(2)}MB) exceeds limit (${opts.maxSizeMB}MB)`));
                            }
                        } else {
                            resolve(blob);
                        }
                    },
                    `image/${opts.format}`,
                    opts.quality! / 100
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Dosya boyutunu kontrol et
 */
export function validateImageSize(file: File, maxSizeMB: number = 1): boolean {
    const sizeMB = file.size / (1024 * 1024);
    return sizeMB <= maxSizeMB;
}

/**
 * Dosya tipini kontrol et
 */
export function validateImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
}

/**
 * Görsel boyutlarını al
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Dosya boyutunu formatla
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
