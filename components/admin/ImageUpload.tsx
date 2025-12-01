'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalı');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    setUploading(true);

    try {
      // Base64'e çevir
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        toast.success('Resim yüklendi');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`
            inline-flex items-center space-x-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'}
            border-neutral-300 dark:border-neutral-600
          `}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Yükleniyor...</span>
            </>
          ) : (
            <>
              {preview ? <ImageIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" /> : <Upload className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {preview ? 'Resmi Değiştir' : 'Resim Yükle'}
              </span>
            </>
          )}
        </label>
        <p className="mt-2 text-xs text-neutral-500">
          PNG, JPG, GIF - Maksimum 5MB
        </p>
      </div>
    </div>
  );
}
