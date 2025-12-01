'use client';

import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, Eye, EyeOff, PenTool, BookOpen, Users, FileText } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // reCAPTCHA kontrolü (sadece key varsa)
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError('Lütfen robot olmadığınızı doğrulayın');
      return;
    }

    setLoading(true);

    try {
      const validated = loginSchema.parse({ email, password });

      // Önce özel login API'mizi çağır (IP ve userAgent loglamak için)
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: validated.email,
          password: validated.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setError(loginData.error || 'Giriş başarısız');
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return;
      }

      // Başarılı ise NextAuth ile session oluştur
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email veya şifre hatalı');
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError('Bir hata oluştu');
      }
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden">
      {/* Arka Plan - Sol tarafta yuvarlak köşeli mor alan */}
      <div className="fixed inset-0 flex pointer-events-none">
        {/* Desktop: Sol tarafta yuvarlak köşeli */}
        <div className="hidden lg:block w-[60vw] h-[150vh] -mt-[25vh] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-r-[50%]" />
        {/* Mobil: Üstte yuvarlak köşeli */}
        <div className="lg:hidden absolute top-0 left-[-25vw] w-[150vw] h-[400px] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-b-[50%]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <PenTool className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">YurtSever Dergi</h1>
            <p className="text-primary-200 text-xs lg:text-sm">İçerik Yönetim Sistemi</p>
          </div>
        </div>

        {/* Sosyal Medya - Desktop */}
        <div className="hidden lg:flex items-center space-x-3">
          <SocialLinks />
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:min-h-[calc(100vh-120px)] gap-8 lg:gap-20">
          
          {/* Sol Taraf - Hoşgeldiniz & Kartlar */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-8 lg:pt-0">
            {/* Hoşgeldiniz - Mobilde gizli, desktop'ta görünür */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-5xl xl:text-6xl font-bold text-white mb-4">Hoşgeldiniz!</h2>
              <svg className="w-72 h-4 mb-8" viewBox="0 0 777.7 31.49" fill="none">
                <path fill="white" d="M777.53,8.67c2.47,20.25-22.19,17.66-36.99,16.81C493.83,10.12,243.96,12.81,0,31.49,256.76-9.41,519.18-2.68,777.53,8.67Z"/>
              </svg>
              <p className="text-primary-100 text-xl max-w-md leading-relaxed">
                Yazılarınızı yönetin, içeriklerinizi düzenleyin ve okuyucularınızla buluşun.
              </p>
            </div>

            {/* Özellik Kartları - Desktop */}
            <div className="hidden lg:grid grid-cols-2 gap-5 mt-8">
              <FeatureCard icon={<FileText className="h-10 w-10" />} title="Yazı Yönetimi" />
              <FeatureCard icon={<Users className="h-10 w-10" />} title="Yazar Profilleri" />
              <FeatureCard icon={<BookOpen className="h-10 w-10" />} title="Kategoriler" />
              <FeatureCard icon={<PenTool className="h-10 w-10" />} title="Zengin Editör" />
            </div>
          </div>

          {/* Sağ Taraf - Login Kartı */}
          <div className="flex flex-col items-center w-full lg:flex-1 lg:flex lg:justify-center">
            {/* Mobil Hoşgeldiniz */}
            <div className="lg:hidden mb-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Hoşgeldiniz!</h2>
              <svg className="w-48 h-3 mx-auto mb-3" viewBox="0 0 777.7 31.49" fill="none">
                <path fill="white" d="M777.53,8.67c2.47,20.25-22.19,17.66-36.99,16.81C493.83,10.12,243.96,12.81,0,31.49,256.76-9.41,519.18-2.68,777.53,8.67Z"/>
              </svg>
              <p className="text-primary-100 text-sm px-4">
                Yazılarınızı yönetin, içeriklerinizi düzenleyin ve okuyucularınızla buluşun.
              </p>
            </div>

            {/* Özellik Kartları - Mobil (Login kartının üstünde) */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-6 justify-items-center">
              <FeatureCard icon={<FileText className="h-8 w-8" />} title="Yazı Yönetimi" />
              <FeatureCard icon={<Users className="h-8 w-8" />} title="Yazar Profilleri" />
              <FeatureCard icon={<BookOpen className="h-8 w-8" />} title="Kategoriler" />
              <FeatureCard icon={<PenTool className="h-8 w-8" />} title="Zengin Editör" />
            </div>

            {/* Login Kartı */}
            <div className="w-full lg:w-[550px] bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-6 lg:p-10">
              <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">Giriş Yap</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="block w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="block w-full pl-12 pr-12 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* reCAPTCHA */}
                {RECAPTCHA_SITE_KEY && (
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={handleRecaptchaChange}
                      theme="light"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (RECAPTCHA_SITE_KEY ? !recaptchaToken : false)}
                  className="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Giriş yapılıyor...</span>
                    </>
                  ) : (
                    <span>Giriş Yap</span>
                  )}
                </button>
              </form>

              {/* Sosyal Medya - Mobil (Kart içinde) */}
              <div className="lg:hidden flex items-center justify-center space-x-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <SocialLinks />
              </div>
            </div>

            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
              © {currentYear} YurtSever Dergi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>


      </main>
    </div>
  );
}

// Özellik Kartı Komponenti
function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-primary-500/80 hover:bg-primary-600/80 backdrop-blur-sm rounded-xl p-5 lg:p-6 w-[160px] lg:w-[200px] transition-colors cursor-pointer">
      <div className="text-white mb-3">{icon}</div>
      <p className="text-white font-medium text-sm lg:text-base">{title}</p>
    </div>
  );
}

// Sosyal Medya Linkleri
function SocialLinks() {
  const links = [
    { href: 'https://facebook.com', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { href: 'https://instagram.com', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { href: 'https://twitter.com', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  ];

  return (
    <>
      {links.map((link, i) => (
        <a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-full flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
            <path d={link.icon} />
          </svg>
        </a>
      ))}
    </>
  );
}
