'use client';

import { useState, useEffect } from 'react';
import { X, Check, Upload, Image as ImageIcon } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onCancel: () => void;
}

export function MediaPicker({ onSelect, onCancel }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Image optimizer'ı import et
      const { optimizeImage, validateImageSize, validateImageType } = await import('@/lib/image-optimizer');
      
      // Validasyon
      if (!validateImageType(file)) {
        alert('Geçersiz dosya tipi! Sadece JPEG, PNG, WebP ve GIF desteklenir.');
        return;
      }
      
      // Boyut kontrolü (5MB'dan büyükse reddet)
      if (!validateImageSize(file, 5)) {
        alert('Dosya çok büyük! Maksimum 5MB olmalıdır.');
        return;
      }
      
      // 1MB'dan büyükse optimize et
      let fileToUpload: File | Blob = file;
      let fileName = file.name;
      
      if (!validateImageSize(file, 1)) {
        try {
          fileToUpload = await optimizeImage(file, {
            maxSizeMB: 1,
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 85,
            format: 'webp',
          });
          fileName = file.name.replace(/\.[^/.]+$/, '.webp');
        } catch (error) {
          console.error('Optimization error:', error);
          alert('Görsel optimize edilemedi. Lütfen daha küçük bir dosya seçin.');
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, fileName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadFiles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Görsel yüklenemedi');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Görsel yüklenemedi');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Medya Kütüphanesi
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="cursor-pointer border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center hover:border-primary-600 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  {uploading ? 'Yükleniyor...' : 'Yeni Görsel Yükle'}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  PNG, JPG, WEBP, GIF (Max 5MB)
                </p>
              </div>
            </label>
          </div>

          {/* Files Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">Yükleniyor...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Henüz görsel yok
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                İlk görselinizi yükleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <button
                  key={file.url}
                  onClick={() => setSelectedUrl(file.url)}
                  className={`bg-white dark:bg-neutral-800 rounded-lg border-2 overflow-hidden transition-all ${
                    selectedUrl === file.url
                      ? 'border-primary-600 ring-2 ring-primary-600'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-400'
                  }`}
                >
                  <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 relative">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedUrl === file.url && (
                      <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                        <div className="bg-primary-600 rounded-full p-2">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedUrl}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Seç
          </button>
        </div>
      </div>
    </div>
  );
}
