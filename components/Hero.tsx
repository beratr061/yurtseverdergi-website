'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthorInfo } from './AuthorInfo';

interface HeroProps {
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string | null;
    category: {
      name: string;
    };
    author?: {
      name: string;
      image?: string;
      slug?: string;
      bio?: string;
    };
    authorRevealDate?: string;
  }>;
}

export function Hero({ articles }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[600px] lg:h-[700px] overflow-hidden bg-neutral-900">
        {/* Slides Container */}
        <div className="relative h-full w-full">
          {articles.map((article, index) => {
            const imageUrl = article.featuredImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=800&fit=crop';

            return (
              <div
                key={article.id}
                className={`absolute inset-0 transition-transform duration-700 ease-in-out ${index === currentSlide
                  ? 'translate-x-0'
                  : index < currentSlide
                    ? '-translate-x-full'
                    : 'translate-x-full'
                  }`}
              >
                {/* Background Image */}
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

                {/* Content */}
                <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-full items-center">
                    <div className="max-w-2xl space-y-6">
                      <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        {article.category.name}
                      </div>

                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        {article.title}
                      </h1>

                      <p className="text-lg text-neutral-200 leading-relaxed">
                        {article.excerpt}
                      </p>

                      <div className="text-neutral-300">
                        <AuthorInfo article={article} variant="inline" forceDark />
                      </div>

                      <Link
                        href={`/yazi/${article.slug}`}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors group"
                      >
                        <span>Devamını Oku</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation and Indicators Container */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Navigation Arrows */}
          <div className="absolute bottom-8 right-8 flex space-x-2 pointer-events-auto">
            <button
              onClick={prevSlide}
              className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Sonraki"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 pointer-events-auto">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                aria-label={`Slayt ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
  );
}
