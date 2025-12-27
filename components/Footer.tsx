'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const navigation = {
    main: [
      { name: 'Şiir', href: '/siir' },
      { name: 'Yazarlar', href: '/yazarlar' },
      { name: 'Poetika', href: '/poetika' },
      { name: 'Söyleşi', href: '/soylesi' },
      { name: 'Eleştiri', href: '/elestiri' },
      { name: 'Hakkımızda', href: '/hakkimizda' },
      { name: 'İletişim', href: '/iletisim' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: Facebook },
      { 
        name: 'X', 
        href: 'https://x.com/YurtseverDergi', 
        icon: () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      },
      { name: 'Instagram', href: 'https://www.instagram.com/yurtseverdergi', icon: Instagram },
      { name: 'Youtube', href: 'https://www.youtube.com/@YurtseverDergi', icon: Youtube },
    ],
  };

  return (
    <footer className="bg-neutral-900 dark:bg-black text-neutral-300 dark:text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mounted && isDark ? "/logo-dark.svg" : "/logo-dark.svg"}
                alt="YurtSever"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Edebiyat ve kültür dünyasının nabzını tutan, şiir ve yazının gücüne inanan bir dergi.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center space-x-2 text-sm font-medium text-white hover:text-neutral-300 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Bize Yazın</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menü</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">E-Bülten</h3>
            <p className="text-sm mb-4">
              Yeni yazılarımızdan ve duyurularımızdan haberdar olun.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {currentYear} YurtSever Dergi. Tüm hakları saklıdır.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {navigation.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                    aria-label={item.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
