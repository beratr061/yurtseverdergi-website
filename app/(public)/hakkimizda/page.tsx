'use client';

import { BookOpen, Users, Target, Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AboutPage() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          
          if (entry.isIntersecting) {
            // Kart görünür alana girdi - ekle
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          } else {
            // Kart görünür alandan çıktı - çıkar
            setVisibleCards((prev) => prev.filter((i) => i !== index));
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = cardsRef.current?.querySelectorAll('[data-index]');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-neutral-900 dark:bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl text-neutral-300 leading-relaxed">
            Edebiyat ve kültür dünyasının nabzını tutan, şiir ve yazının gücüne inanan bir dergi
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              Edebiyatın Kalbi
            </h2>
            
            <div className="space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>
                YurtSever Dergi, Türk edebiyatının zengin mirasını bugüne taşıyan ve geleceğe ışık tutan 
                bir edebiyat platformudur. Şiir, deneme, eleştiri ve söyleşi türlerinde kaliteli içerikler 
                üreterek, edebiyat severleri bir araya getiriyoruz.
              </p>

              <p>
                Amacımız, sadece bir dergi olmaktan öte, edebiyat ve kültür dünyasında anlamlı bir topluluk 
                oluşturmaktır. Genç yeteneklere fırsat tanırken, köklü yazarlarımızın deneyimlerinden de 
                faydalanıyoruz. Her yazı, her şiir, edebiyatın gücüne olan inancımızın bir yansımasıdır.
              </p>

              <p>
                Dijital çağda edebiyatın değerini korumak ve yaymak için çalışıyoruz. Modern teknolojinin 
                sunduğu imkanları kullanarak, edebiyatı daha geniş kitlelere ulaştırmayı hedefliyoruz. 
                Ancak bunu yaparken, içeriğin kalitesinden asla ödün vermiyoruz.
              </p>

              <p>
                Editörlerimiz, her yazıyı özenle seçiyor ve değerlendiriyor. Okuyucularımıza en iyi 
                edebiyat deneyimini sunmak için titizlikle çalışıyoruz. Çünkü inanıyoruz ki, kaliteli 
                edebiyat toplumu dönüştürme gücüne sahiptir.
              </p>

              <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                YurtSever Dergi olarak, edebiyatın gücüne inanıyor ve bu gücü sizlerle paylaşmaktan 
                mutluluk duyuyoruz. Çünkü edebiyat, sadece kelimeler değil; düşünceler, duygular ve 
                hayallerin en saf halidir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-12">
            Değerlerimiz
          </h2>
          
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Kaliteli İçerik',
                description: 'Edebiyatın ve şiirin en kaliteli örneklerini okuyucularımıza sunuyoruz.',
              },
              {
                icon: Users,
                title: 'Topluluk',
                description: 'Yazarlar ve okuyucular arasında güçlü bir topluluk oluşturuyoruz.',
              },
              {
                icon: Target,
                title: 'Misyon',
                description: 'Türk edebiyatına katkıda bulunmak ve yeni sesleri keşfetmek.',
              },
              {
                icon: Heart,
                title: 'Tutku',
                description: 'Edebiyata ve sanata olan tutkumuzla hareket ediyoruz.',
              },
            ].map((value, index) => {
              const Icon = value.icon;
              const isVisible = visibleCards.includes(index);
              
              return (
                <div
                  key={index}
                  data-index={index}
                  className={`text-center transform transition-all duration-700 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-lg mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
