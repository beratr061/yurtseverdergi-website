'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ImageUpload } from './ImageUpload';

const userSchema = z.object({
  name: z.string().min(1, 'Ad Soyad gerekli'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı').optional().or(z.literal('')),
  role: z.enum(['WRITER', 'POET']),
  slug: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  fullBio: z.string().optional(),
  education: z.string().optional(),
  awards: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    slug?: string;
    bio?: string;
    image?: string;
    fullBio?: string;
    education?: string;
    awards?: any;
  };
}

// Türkçe karakterleri dönüştüren slug fonksiyonu
const generateSlug = (text: string): string => {
  const turkishMap: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    İ: 'i',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  };

  return text
    .toLowerCase()
    .trim()
    .split('')
    .map((char) => turkishMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!user?.slug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role as 'WRITER' | 'POET',
          password: '',
          slug: user.slug || '',
          bio: user.bio || '',
          image: user.image || '',
          fullBio: user.fullBio || '',
          education: user.education || '',
          awards: Array.isArray(user.awards) ? user.awards.join('\n') : '',
        }
      : {
          role: 'POET',
        },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';

      // Awards'ı array'e çevir
      const payload = {
        ...data,
        awards: data.awards ? data.awards.split('\n').filter((a: string) => a.trim()) : [],
        password: data.password || undefined, // Boşsa gönderme
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bir hata oluştu');
      }

      toast.success(user ? 'Kullanıcı güncellendi' : 'Kullanıcı oluşturuldu');
      router.push('/admin/users');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol Sütun - Kullanıcı Bilgileri */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Kullanıcı Bilgileri
            </h2>

            <div className="space-y-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  {...register('name', {
                    onChange: (e) => {
                      if (!slugManuallyEdited) {
                        setValue('slug', generateSlug(e.target.value));
                      }
                    },
                  })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="Kadir Korkut"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Şifre {user && '(Değiştirmek için doldurun)'}
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">Minimum 8 karakter</p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Rol *
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="POET">Şair</option>
                  <option value="WRITER">Yazar</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  {...register('slug', {
                    onChange: () => setSlugManuallyEdited(true),
                  })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="kadir-korkut"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  /yazar/{watch('slug') || 'slug'}
                </p>
              </div>
            </div>
          </div>

          {/* Profil Resmi - Sol sütunda */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Profil Resmi
            </h2>
            <ImageUpload value={watch('image') || ''} onChange={(url) => setValue('image', url)} />
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
          </div>
        </div>

        {/* Sağ Sütun - Profil Bilgileri */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 h-fit">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Profil Bilgileri
          </h2>

          <div className="space-y-4">
            {/* Kısa Bio */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Kısa Biyografi
              </label>
              <textarea
                {...register('bio')}
                rows={2}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Şair ve yazar..."
              />
              <p className="mt-1 text-xs text-neutral-500">Yazar kartlarında gösterilir</p>
            </div>

            {/* Detaylı Biyografi */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Detaylı Biyografi
              </label>
              <textarea
                {...register('fullBio')}
                rows={5}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Detaylı biyografi..."
              />
              <p className="mt-1 text-xs text-neutral-500">Yazar profil sayfasında gösterilir</p>
            </div>

            {/* Eğitim */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Eğitim
              </label>
              <input
                type="text"
                {...register('education')}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="İstanbul Üniversitesi Edebiyat Fakültesi"
              />
            </div>

            {/* Ödüller */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Ödüller
              </label>
              <textarea
                {...register('awards')}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Her satıra bir ödül yazın..."
              />
              <p className="mt-1 text-xs text-neutral-500">Her satıra bir ödül yazın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Kaydediliyor...' : user ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
}
