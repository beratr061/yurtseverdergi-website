'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onComplete: (croppedImage: string) => void;
    onCancel: () => void;
    aspect?: number;
    cropShape?: 'rect' | 'round';
}

export function ImageCropper({ image, onComplete, onCancel, aspect = 1, cropShape = 'round' }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const handleComplete = async () => {
        if (!croppedAreaPixels) return;

        setLoading(true);
        try {
            // Get cropped image as base64
            const croppedImageBase64 = await getCroppedImgAsBase64(image, croppedAreaPixels);
            onComplete(croppedImageBase64);
        } catch (error) {
            console.error('Crop error:', error);
            alert('Görsel kırpılamadı');
        } finally {
            setLoading(false);
        }
    };

    const getCroppedImgAsBase64 = async (
        imageSrc: string,
        pixelCrop: any
    ): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        // Boyut sınırlaması (max 1920x1080)
        let width = pixelCrop.width;
        let height = pixelCrop.height;
        
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            width,
            height
        );

        // WebP formatında döndür (daha küçük dosya boyutu)
        // Fallback: JPEG (eski tarayıcılar için)
        let dataUrl = canvas.toDataURL('image/webp', 0.85);
        
        // WebP desteklenmiyorsa JPEG kullan
        if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
        
        return dataUrl;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Görseli Kırp
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cropper */}
                <div className="relative flex-1 bg-neutral-900" style={{ minHeight: '400px' }}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        cropShape={cropShape}
                        showGrid={cropShape === 'rect'}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
                    {/* Zoom Slider */}
                    <div className="flex items-center space-x-4">
                        <ZoomOut className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <ZoomIn className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 inline-flex items-center space-x-2"
                        >
                            <Check className="h-4 w-4" />
                            <span>{loading ? 'Yükleniyor...' : 'Uygula'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
