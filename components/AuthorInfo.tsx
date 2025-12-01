'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { LockedAvatar } from './LockedAvatar';
import { Countdown } from './Countdown';
import { isAuthorRevealed } from '@/lib/author-reveal';

interface AuthorInfoProps {
  article: {
    author?: {
      name: string;
      image?: string;
      slug?: string;
      bio?: string;
    };
    authorRevealDate?: string;
  };
  variant?: 'card' | 'inline' | 'compact';
  showBio?: boolean;
  disableLink?: boolean;
  forceDark?: boolean; // Hero gibi karanlık arka planlı alanlarda kullanmak için
}

export function AuthorInfo({ article, variant = 'card', showBio = false, disableLink = false, forceDark = false }: AuthorInfoProps) {
  const revealed = isAuthorRevealed(article);

  // Compact variant (liste görünümü için)
  if (variant === 'compact') {
    if (!revealed) {
      return (
        <div className="flex items-center space-x-2">
          <LockedAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
              Yazar gizli
            </p>
            {article.authorRevealDate && (
              <Countdown revealDate={article.authorRevealDate} compact />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {article.author?.image ? (
          <img
            src={article.author.image}
            alt={article.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <User className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.author?.slug && !disableLink ? (
            <Link
              href={`/yazar/${article.author.slug}`}
              className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 transition-colors truncate block"
            >
              {article.author.name}
            </Link>
          ) : (
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {article.author?.name || 'Anonim'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline variant (yazı içinde)
  if (variant === 'inline') {
    const textColor = forceDark ? 'text-white' : 'text-neutral-900 dark:text-neutral-100';
    const mutedColor = forceDark ? 'text-neutral-300' : 'text-neutral-600 dark:text-neutral-400';
    
    if (!revealed) {
      return (
        <div className={`inline-flex items-center space-x-2 text-sm ${mutedColor}`}>
          <LockedAvatar size="sm" />
          <span>Yazar gizli</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center space-x-2">
        {article.author?.image && (
          <img
            src={article.author.image}
            alt={article.author.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        )}
        {article.author?.slug && !disableLink ? (
          <Link
            href={`/yazar/${article.author.slug}`}
            className={`text-sm font-medium ${textColor} hover:text-primary-400 transition-colors`}
          >
            {article.author.name}
          </Link>
        ) : (
          <span className={`text-sm font-medium ${textColor}`}>
            {article.author?.name || 'Anonim'}
          </span>
        )}
      </div>
    );
  }

  // Card variant (detay sayfası için)
  if (!revealed) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-white dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-md opacity-30 scale-110" />
              <LockedAvatar size="lg" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
                Yazar
              </p>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Yazar Gizli
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Yazarın kimliği yakında açıklanacak
              </p>

              {article.authorRevealDate && (
                <div className="inline-block">
                  <Countdown revealDate={article.authorRevealDate} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Revealed state
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-white dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with glow effect */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity scale-110" />
            {article.author?.image ? (
              <img
                src={article.author.image}
                alt={article.author.name}
                className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-neutral-800 shadow-xl"
              />
            ) : (
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-4 ring-white dark:ring-neutral-800 shadow-xl">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
              Yazar
            </p>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {article.author?.name || 'Anonim'}
            </h3>
            {showBio && article.author?.bio && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 max-w-md">
                {article.author.bio}
              </p>
            )}

            {article.author?.slug && (
              <Link
                href={`/yazar/${article.author.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Profili Görüntüle</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
