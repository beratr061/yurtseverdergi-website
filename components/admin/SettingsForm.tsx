'use client';

import { useState, useEffect } from 'react';
import { Save, Shield, AlertCircle, CheckCircle, Wrench, Mail, Calendar, Image, Twitter, Instagram, Facebook, X, Download, Eye, Trash2 } from 'lucide-react';
import { MediaPicker } from './MediaPicker';

interface Settings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  invitationMode: boolean;
  invitationHeadline: string;
  invitationDescription: string;
  invitationLaunchDate: string;
  invitationBackgroundImage: string;
  invitationTwitterUrl: string;
  invitationInstagramUrl: string;
  invitationFacebookUrl: string;
}

interface InvitationEmail {
  id: string;
  email: string;
  subscribedAt: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export function SettingsForm() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailCount, setEmailCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [settings, setSettings] = useState<Settings>({
    maintenanceMode: false,
    maintenanceMessage: '',
    invitationMode: false,
    invitationHeadline: '',
    invitationDescription: '',
    invitationLaunchDate: '',
    invitationBackgroundImage: '',
    invitationTwitterUrl: '',
    invitationInstagramUrl: '',
    invitationFacebookUrl: '',
  });


  useEffect(() => {
    fetchSettings();
    fetchEmailCount();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        if (data) {
          setSettings({
            maintenanceMode: data.maintenanceMode || false,
            maintenanceMessage: data.maintenanceMessage || '',
            invitationMode: data.invitationMode || false,
            invitationHeadline: data.invitationHeadline || '',
            invitationDescription: data.invitationDescription || '',
            invitationLaunchDate: data.invitationLaunchDate ? new Date(data.invitationLaunchDate).toISOString().slice(0, 16) : '',
            invitationBackgroundImage: data.invitationBackgroundImage || '',
            invitationTwitterUrl: data.invitationTwitterUrl || '',
            invitationInstagramUrl: data.invitationInstagramUrl || '',
            invitationFacebookUrl: data.invitationFacebookUrl || '',
          });
        }
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchEmailCount = async () => {
    try {
      const response = await fetch('/api/invitation/emails');
      if (response.ok) {
        const result = await response.json();
        setEmailCount(result.count || 0);
      }
    } catch (error) {
      console.error('Email count fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setValidationErrors({});

    try {
      const payload = {
        ...settings,
        invitationLaunchDate: settings.invitationLaunchDate ? new Date(settings.invitationLaunchDate).toISOString() : null,
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
      } else if (result.code === 'VALIDATION_ERROR' && result.details) {
        setValidationErrors(result.details);
        setMessage({ type: 'error', text: 'Lütfen hataları düzeltin.' });
      } else {
        setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi. Lütfen tekrar deneyin.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/invitation/emails/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invitation-emails-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImageSelect = (url: string) => {
    setSettings({ ...settings, invitationBackgroundImage: url });
    setShowMediaPicker(false);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-4 flex items-start space-x-3 ${message.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success'
            ? 'text-green-800 dark:text-green-200'
            : 'text-red-800 dark:text-red-200'
            }`}>
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Davet Modu */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Davet Modu
            </h3>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Bilgi</p>
                <p>Davet modunu aktif ettiğinizde, site ziyaretçilere özel bir davet sayfası gösterecektir. Admin paneline erişim korunur.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 mb-6">
            <input
              type="checkbox"
              id="invitationMode"
              checked={!!settings.invitationMode}
              onChange={(e) => setSettings({ ...settings, invitationMode: e.target.checked })}
              className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-600"
            />
            <div className="flex-1">
              <label htmlFor="invitationMode" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                Davet modunu aktif et
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Site ziyaretçilere davet sayfası gösterilecek
              </p>
            </div>
          </div>

          {settings.invitationMode && (
            <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
              {/* Headline */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Başlık
                </label>
                <input
                  type="text"
                  value={settings.invitationHeadline}
                  onChange={(e) => setSettings({ ...settings, invitationHeadline: e.target.value })}
                  placeholder="Yakında sizlerle..."
                  maxLength={200}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    validationErrors.invitationHeadline ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                />
                {validationErrors.invitationHeadline && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.invitationHeadline}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">{settings.invitationHeadline.length}/200</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={settings.invitationDescription}
                  onChange={(e) => setSettings({ ...settings, invitationDescription: e.target.value })}
                  placeholder="Sitemiz çok yakında yayında olacak..."
                  maxLength={1000}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    validationErrors.invitationDescription ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                />
                {validationErrors.invitationDescription && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.invitationDescription}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">{settings.invitationDescription.length}/1000</p>
              </div>

              {/* Launch Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Lansman Tarihi (Geri Sayım için)
                </label>
                <input
                  type="datetime-local"
                  value={settings.invitationLaunchDate}
                  onChange={(e) => setSettings({ ...settings, invitationLaunchDate: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    validationErrors.invitationLaunchDate ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                />
                {validationErrors.invitationLaunchDate && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.invitationLaunchDate}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">Boş bırakılırsa geri sayım gösterilmez</p>
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Image className="inline h-4 w-4 mr-1" />
                  Arka Plan Görseli
                </label>
                <div className="flex items-center space-x-3">
                  {settings.invitationBackgroundImage ? (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700">
                      <img
                        src={settings.invitationBackgroundImage}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, invitationBackgroundImage: '' })}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm"
                  >
                    {settings.invitationBackgroundImage ? 'Değiştir' : 'Görsel Seç'}
                  </button>
                </div>
              </div>

              {/* Social Media URLs */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Sosyal Medya Linkleri
                </label>
                
                <div className="flex items-center space-x-3">
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                  <input
                    type="url"
                    value={settings.invitationTwitterUrl}
                    onChange={(e) => setSettings({ ...settings, invitationTwitterUrl: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className={`flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                      validationErrors.invitationTwitterUrl ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {validationErrors.invitationTwitterUrl && (
                  <p className="text-xs text-red-500 ml-8">{validationErrors.invitationTwitterUrl}</p>
                )}

                <div className="flex items-center space-x-3">
                  <Instagram className="h-5 w-5 text-[#E4405F]" />
                  <input
                    type="url"
                    value={settings.invitationInstagramUrl}
                    onChange={(e) => setSettings({ ...settings, invitationInstagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className={`flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                      validationErrors.invitationInstagramUrl ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {validationErrors.invitationInstagramUrl && (
                  <p className="text-xs text-red-500 ml-8">{validationErrors.invitationInstagramUrl}</p>
                )}

                <div className="flex items-center space-x-3">
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                  <input
                    type="url"
                    value={settings.invitationFacebookUrl}
                    onChange={(e) => setSettings({ ...settings, invitationFacebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className={`flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                      validationErrors.invitationFacebookUrl ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {validationErrors.invitationFacebookUrl && (
                  <p className="text-xs text-red-500 ml-8">{validationErrors.invitationFacebookUrl}</p>
                )}
              </div>
            </div>
          )}
        </div>


        {/* E-posta Listesi - Only show when invitation mode is enabled */}
        {settings.invitationMode && (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  E-posta Aboneleri
                </h3>
              </div>
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {emailCount} abone
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Davet sayfasından e-posta bırakan ziyaretçilerin listesi
            </p>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm inline-flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Listeyi Görüntüle</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm inline-flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>CSV İndir</span>
              </button>
            </div>
          </div>
        )}

        {/* Bakım Modu */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wrench className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Bakım Modu
            </h3>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Dikkat!</p>
                <p>Bakım modunu aktif ettiğinizde, site normal ziyaretçilere kapalı olacaktır. Sadece admin kullanıcılar siteye erişebilir.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="maintenance"
              checked={!!settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-600"
            />
            <div className="flex-1">
              <label htmlFor="maintenance" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                Bakım modunu aktif et
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Site ziyaretçilere kapalı olacak, özel bakım sayfası gösterilecek
              </p>
            </div>
          </div>

          {settings.maintenanceMode && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Bakım Mesajı (Opsiyonel)
              </label>
              <textarea
                rows={3}
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                placeholder="Ziyaretçilere gösterilecek özel mesaj..."
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          )}
        </div>

        {/* Yakında Eklenecek Özellikler */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Yakında
            </h3>
          </div>
          
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <p>• Yedekleme ve geri yükleme</p>
            <p>• E-posta bildirimleri</p>
            <p>• SEO ayarları</p>
            <p>• Sosyal medya entegrasyonu</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 inline-flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={handleImageSelect}
          onCancel={() => setShowMediaPicker(false)}
        />
      )}

      {/* Email List Modal */}
      {showEmailModal && (
        <EmailListModal
          onClose={() => {
            setShowEmailModal(false);
            fetchEmailCount();
          }}
        />
      )}
    </div>
  );
}


// EmailListModal Component
interface EmailListModalProps {
  onClose: () => void;
}

function EmailListModal({ onClose }: EmailListModalProps) {
  const [emails, setEmails] = useState<InvitationEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/invitation/emails');
      if (response.ok) {
        const result = await response.json();
        setEmails(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu e-postayı silmek istediğinizden emin misiniz?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/invitation/emails/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEmails(emails.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Pagination
  const totalPages = Math.ceil(emails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmails = emails.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            E-posta Aboneleri ({emails.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-neutral-600 dark:text-neutral-400 mt-4">Yükleniyor...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Henüz abone yok
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                Davet sayfasından e-posta bırakan ziyaretçiler burada görünecek
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedEmails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {email.email}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {formatDate(email.subscribedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(email.id)}
                    disabled={deleting === email.id}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Sil"
                  >
                    {deleting === email.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Sayfa {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
