'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
  Cloud,
  CloudOff,
  Loader2,
  Send,
  History,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ImageCropper } from './ImageCropper';
import { MediaPicker } from './MediaPicker';
import { ArticleVersionHistory } from './ArticleVersionHistory';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleFormProps {
  categories: Category[];
  article?: any;
  userRole?: string;
}

export function ArticleForm({ categories, article, userRole = 'POET' }: ArticleFormProps) {
  const canPublish = userRole === 'ADMIN';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [tags, setTags] = useState<string[]>(article?.tags?.map((t: any) => t.name) || []);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    categoryId: article?.categoryId || '',
    featuredImage: article?.featuredImage || '',
    status: article?.status || 'DRAFT',
  });

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const hasContentChanged = useRef(false);
  const initialContent = useRef({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
  });

  // Auto-save function
  const autoSave = useCallback(async () => {
    // Only auto-save if content has actually changed
    if (!hasContentChanged.current) return;
    
    // Only auto-save if we have minimum required data and it's an existing article
    if (!formData.title || !formData.slug || !formData.categoryId) return;
    if (!article?.id) return; // Don't auto-save new articles

    setAutoSaveStatus('saving');

    try {
      const payload = {
        ...formData,
        status: formData.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        tags,
        id: article?.id,
      };

      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        // Başarılı kayıttan sonra initial content'i güncelle
        initialContent.current = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
        };
        hasContentChanged.current = false;
      } else {
        setAutoSaveStatus('error');
      }
    } catch {
      setAutoSaveStatus('error');
    }
  }, [formData, tags, article?.id]);

  // İçerik değişikliğini takip et
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // İçerik değişti mi kontrol et
    const contentChanged = 
      formData.title !== initialContent.current.title ||
      formData.excerpt !== initialContent.current.excerpt ||
      formData.content !== initialContent.current.content;

    if (contentChanged && !hasContentChanged.current) {
      hasContentChanged.current = true;
      
      // İçerik değiştiğinde 10 dakikalık timer başlat
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // 10 dakika = 600000ms
      autoSaveTimerRef.current = setTimeout(() => {
        if (article?.id && hasContentChanged.current) {
          autoSave();
        }
      }, 600000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData.title, formData.excerpt, formData.content, autoSave, article?.id]);

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Az önce kaydedildi';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce kaydedildi`;
    return lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      status,
      tags,
      id: article?.id,
    };

    console.log('Submitting article:', {
      ...payload,
      featuredImage: payload.featuredImage?.substring(0, 100) + '...' // Sadece ilk 100 karakter
    });

    try {
      const response = await fetch('/api/articles', {
        method: article ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(article ? 'Makale güncellendi!' : 'Makale oluşturuldu!');
        router.push('/admin/articles');
        router.refresh();
      } else {
        const data = await response.json();
        console.error('API Error:', data);
        const errorMsg = data.field 
          ? `${data.field}: ${data.error}` 
          : data.error || 'Bir hata oluştu';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!article?.id) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${article.id}/submit`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Yazı onaya gönderildi!');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\wçğıöşüÇĞİÖŞÜ-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
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
    setFormData(prev => ({ ...prev, featuredImage: croppedImageUrl }));
    setCropImage(null);
  };

  const handleCropCancel = () => {
    setCropImage(null);
  };

  const handleMediaSelect = (url: string) => {
    setFormData(prev => ({ ...prev, featuredImage: url }));
    setShowMediaPicker(false);
  };

  const handleMediaCancel = () => {
    setShowMediaPicker(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featuredImage: '' }));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
      {cropImage && (
        <ImageCropper
          image={cropImage}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={16 / 9}
          cropShape="rect"
        />
      )}

      {showMediaPicker && (
        <MediaPicker
          onSelect={handleMediaSelect}
          onCancel={handleMediaCancel}
        />
      )}

      {article?.id && (
        <ArticleVersionHistory
          articleId={article.id}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={() => router.refresh()}
        />
      )}

      <form className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Yazı başlığı..."
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    URL (Slug) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="yazi-url"
                    required
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    URL: /yazi/{formData.slug}
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Özet *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Kısa özet..."
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    İçerik *
                  </label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Yayınla
                </h3>
                {/* Auto-save Status */}
                {article?.id && (
                  <div className="flex items-center space-x-1 text-xs">
                    {autoSaveStatus === 'saving' && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
                        <span className="text-neutral-400">Kaydediliyor...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <Cloud className="h-3 w-3 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">{formatLastSaved()}</span>
                      </>
                    )}
                    {autoSaveStatus === 'error' && (
                      <>
                        <CloudOff className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Kaydetme hatası</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Reddedilme Nedeni */}
              {article?.status === 'REJECTED' && article?.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">Reddedilme Nedeni</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{article.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Onay Bekliyor Uyarısı */}
              {article?.status === 'PENDING_REVIEW' && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">Bu yazı editör onayı bekliyor.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'DRAFT')}
                  disabled={loading || submitting}
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Taslak Olarak Kaydet
                </button>

                {canPublish ? (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                    disabled={loading || submitting}
                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4 inline mr-2" />
                    Yayınla
                  </button>
                ) : (
                  <>
                    {/* Writer için onaya gönderme butonu */}
                    {article?.id && ['DRAFT', 'REJECTED'].includes(article?.status) && (
                      <button
                        type="button"
                        onClick={handleSubmitForReview}
                        disabled={loading || submitting}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                      >
                        <Send className="h-4 w-4 inline mr-2" />
                        {submitting ? 'Gönderiliyor...' : 'Onaya Gönder'}
                      </button>
                    )}
                    {!article?.id && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        Önce taslak olarak kaydedin, sonra onaya gönderebilirsiniz.
                      </div>
                    )}
                  </>
                )}

                {/* Versiyon Geçmişi Butonu */}
                {article?.id && (
                  <button
                    type="button"
                    onClick={() => setShowVersionHistory(true)}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    <History className="h-4 w-4 inline mr-2" />
                    Versiyon Geçmişi
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Kategori *
              </h3>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Etiketler
              </h3>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Etiket ekle (Enter ile)"
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 mb-3"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-900 dark:hover:text-primary-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Öne Çıkan Görsel
              </h3>

              {formData.featuredImage ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
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
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
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
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Görsel URL'si girin..."
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
