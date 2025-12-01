'use client';

import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

interface BulkImageUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export function BulkImageUpload({ onUploadComplete }: BulkImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<{ name: string; error: string }[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleUpload(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleUpload(files);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Filter only images
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Sadece resim dosyaları yükleyebilirsiniz');
      return;
    }

    if (imageFiles.length > 10) {
      toast.error('En fazla 10 dosya yükleyebilirsiniz');
      return;
    }

    setUploading(true);
    setErrors([]);

    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedFiles((prev) => [...prev, ...data.uploaded]);
        if (data.errors) {
          setErrors(data.errors);
        }
        toast.success(data.message);
        onUploadComplete?.(data.uploaded);
      } else {
        toast.error(data.error || 'Yükleme başarısız');
      }
    } catch (error) {
      toast.error('Yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL kopyalandı');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          {uploading ? (
            <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin" />
          ) : (
            <Upload className="h-12 w-12 mx-auto text-neutral-400" />
          )}

          <div>
            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              {uploading ? 'Yükleniyor...' : 'Resimleri sürükleyip bırakın'}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              veya dosya seçmek için tıklayın (max 10 dosya, 5MB/dosya)
            </p>
          </div>

          <p className="text-xs text-neutral-400">
            Desteklenen formatlar: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-200">Bazı dosyalar yüklenemedi</span>
          </div>
          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>
                {err.name}: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
            Yüklenen Dosyalar ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.url}
                className="relative group bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
              >
                <div className="aspect-square relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => copyUrl(file.url)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                      title="URL Kopyala"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFile(file.url)}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                      title="Kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-400">{formatSize(file.size)}</p>
                </div>
                <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
