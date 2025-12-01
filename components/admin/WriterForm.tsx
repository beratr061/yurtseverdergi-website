'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageCropper } from './ImageCropper';
import { MediaPicker } from './MediaPicker';

interface WriterFormProps {
  writer?: {
    id: string;
    name: string;
    slug: string;
    role: string;
    bio: string;
    fullBio: string;
    image: string;
    birthYear: number | null;
    education: string | null;
    awards: string[];
  };
}

const writerRoles = [
  'Şair',
  'Eleştirmen',
  'Yazar',
  'Akademisyen',
  'Çevirmen',
  'Editör',
  'Araştırmacı',
  'Deneme Yazarı',
  'Romancı',
  'Öykücü',
];

export function WriterForm({ writer }: WriterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: writer?.name || '',
    slug: writer?.slug || '',
    role: writer?.role || '',
    bio: writer?.bio || '',
    fullBio: writer?.fullBio || '',
    image: writer?.image || '',
    birthYear: writer?.birthYear?.toString() || '',
    education: writer?.education || '',
    awards: writer?.awards?.join('\n') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/writers', {
        method: writer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
          awards: formData.awards.split('\n').filter(a => a.trim()),
          id: writer?.id,
        }),
      });

      if (response.ok) {
        router.push('/admin/writers');
        router.refresh();
      } else {
        alert('Bir hata oluştu');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\wçğıöşüÇĞİÖŞÜ-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData(prev => ({ ...prev, image: croppedImageUrl }));
    setCropImage(null);
  };

  const handleCropCancel = () => {
    setCropImage(null);
  };

  const handleMediaSelect = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setShowMediaPicker(false);
  };

  const handleMediaCancel = () => {
    setShowMediaPicker(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <>
      {cropImage && (
        <ImageCropper
          image={cropImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={1}
        />
      )}

      {showMediaPicker && (
        <MediaPicker
          onSelect={handleMediaSelect}
          onCancel={handleMediaCancel}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Yazar Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Yazar adı..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    URL (Slug) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="yazar-adi"
                    required
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    URL: /yazar/{formData.slug}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  >
                    <option value="">Rol seçin</option>
                    {writerRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Kısa Biyografi *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Kısa biyografi (1-2 cümle)..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Detaylı Biyografi *
                  </label>
                  <textarea
                    value={formData.fullBio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullBio: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Detaylı biyografi..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Doğum Yılı
                    </label>
                    <input
                      type="number"
                      value={formData.birthYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      placeholder="1980"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Eğitim
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      placeholder="Üniversite adı"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Ödüller
                  </label>
                  <textarea
                    value={formData.awards}
                    onChange={(e) => setFormData(prev => ({ ...prev, awards: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Her satıra bir ödül..."
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Her satıra bir ödül yazın
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Kaydet
              </h3>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 inline-flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{writer ? 'Güncelle' : 'Oluştur'}</span>
              </button>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Profil Fotoğrafı *
              </h3>

              {formData.image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Görseli Kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
                    placeholder="https://..."
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="cursor-pointer border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-6 text-center hover:border-primary-600 transition-colors">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Yükle
                        </p>
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-6 text-center hover:border-primary-600 transition-colors"
                    >
                      <ImageIcon className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Kütüphaneden Seç
                      </p>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500">veya</span>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Fotoğraf URL'si..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
