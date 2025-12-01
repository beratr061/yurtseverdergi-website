'use client';

import { useState, useEffect } from 'react';
import { Upload, Copy, Check, Image as ImageIcon, Trash2, User } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  ownerId?: string;
  isOwn?: boolean;
}

interface MediaLibraryProps {
  userRole?: string;
  userId?: string;
}

export function MediaLibrary({ userRole = 'POET', userId }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [canSeeAll, setCanSeeAll] = useState(false);

  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
        setCanSeeAll(data.canSeeAll);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
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
      
      // Boyut kontrolü (5MB'dan büyükse optimize et)
      let fileToUpload: File | Blob = file;
      
      if (!validateImageSize(file, 5)) {
        alert('Dosya çok büyük! Maksimum 5MB olmalıdır.');
        return;
      }
      
      // 1MB'dan büyükse optimize et
      if (!validateImageSize(file, 1)) {
        try {
          fileToUpload = await optimizeImage(file, {
            maxSizeMB: 1,
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 85,
            format: 'webp',
          });
        } catch (error) {
          console.error('Optimization error:', error);
          alert('Görsel optimize edilemedi. Lütfen daha küçük bir dosya seçin.');
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, file.name.replace(/\.[^/.]+$/, '.webp'));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        loadFiles();
      } else {
        alert('Görsel yüklenemedi');
      }
    } catch (error) {
      alert('Görsel yüklenemedi');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeleting(fileName);
    try {
      const response = await fetch(`/api/media/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadFiles();
      } else {
        alert('Görsel silinemedi');
      }
    } catch (error) {
      alert('Görsel silinemedi');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center hover:border-primary-600 transition-colors">
            <Upload className="h-10 w-10 mx-auto mb-3 text-neutral-400" />
            <p className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1">
              {uploading ? 'Yükleniyor...' : 'Görsel Yüklemek İçin Tıklayın'}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              PNG, JPG, WEBP, GIF (Maksimum 5MB)
            </p>
          </div>
        </label>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {canSeeAll ? 'Henüz görsel yok' : 'Henüz görseliniz yok'}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            İlk görselinizi yükleyerek başlayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => {
            // Silme yetkisi: Admin her şeyi silebilir, Writer sadece kendisininkileri
            const canDelete = isAdmin || file.isOwn;

            return (
              <div
                key={file.url}
                className={`bg-white dark:bg-neutral-900 rounded-lg border overflow-hidden group ${
                  file.isOwn
                    ? 'border-primary-300 dark:border-primary-700'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Sahiplik göstergesi - Admin/Editor için */}
                  {canSeeAll && !file.isOwn && (
                    <div className="absolute top-2 left-2 p-1.5 bg-neutral-900/70 rounded-full" title="Başka kullanıcıya ait">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {file.isOwn && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600/90 rounded-full">
                      <span className="text-[10px] text-white font-medium">Sizin</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="URL'yi Kopyala"
                    >
                      {copiedUrl === file.url ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <Copy className="h-6 w-6 text-white" />
                      )}
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(file.name)}
                        disabled={deleting === file.name}
                        className="p-3 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className="h-6 w-6 text-white" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
