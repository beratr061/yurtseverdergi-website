'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EmailSubscriptionForm } from '@/components/EmailSubscriptionForm';

// Animation keyframes
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes quillWrite {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }
  
  .animate-fade-in {
    animation: fadeIn 1s ease-out forwards;
    opacity: 0;
  }
  
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  
  .animate-quill {
    animation: quillWrite 3s ease-in-out infinite;
  }
  
  .text-shadow-elegant {
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }
  
  .hover-glow {
    transition: all 0.3s ease;
  }
  
  .hover-glow:hover {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
    transform: scale(1.05);
  }
`;

// Tüy kalem ikonu
const QuillIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

// Social icons
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface InvitationPageProps {
  settings: {
    siteTitle: string;
    contactEmail?: string | null;
    invitationHeadline?: string | null;
    invitationDescription?: string | null;
    invitationLaunchDate?: Date | string | null;
    invitationBackgroundImage?: string | null;
    invitationTwitterUrl?: string | null;
    invitationInstagramUrl?: string | null;
    invitationFacebookUrl?: string | null;
  };
}

export function InvitationPage({ settings }: InvitationPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    siteTitle,
    contactEmail,
    invitationHeadline,
    invitationDescription,
    invitationBackgroundImage,
    invitationTwitterUrl,
    invitationInstagramUrl,
    invitationFacebookUrl,
  } = settings;

  const hasSocialLinks = invitationTwitterUrl || invitationInstagramUrl || invitationFacebookUrl;

  // Varsayılan edebi metinler
  const defaultHeadline = "Kalem Sizin, Sahne Hazır";
  const defaultDescription = "Yeni bir edebiyat yuvası doğuyor. Şiirleriniz, hikâyeleriniz ve düşünceleriniz için bir ev arıyorsanız, doğru yerdesiniz. Yazarlarımız arasına katılın, sesinizi duyurun.";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        {/* Background */}
        {invitationBackgroundImage ? (
          <div className={`absolute inset-0 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <Image
              src={invitationBackgroundImage}
              alt="Background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/60 to-neutral-950/90" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
            {/* Dekoratif arka plan deseni */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 left-10 text-9xl font-serif text-white/20 select-none">"</div>
              <div className="absolute bottom-20 right-10 text-9xl font-serif text-white/20 select-none rotate-180">"</div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl text-center">
            
            {/* Tüy Kalem İkonu */}
            <div 
              className={`mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.1s' }}
            >
              <QuillIcon className="h-16 w-16 mx-auto text-primary-400/80 animate-quill" />
            </div>

            {/* Site Başlığı */}
            <h1 
              className={`text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-6 text-shadow-elegant ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.2s' }}
            >
              {siteTitle}
            </h1>

            {/* Dekoratif çizgi */}
            <div 
              className={`flex items-center justify-center gap-4 mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.3s' }}
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary-500/50" />
              <div className="h-2 w-2 rounded-full bg-primary-500/70" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary-500/50" />
            </div>

            {/* Ana Başlık - Edebi Çağrı */}
            <h2 
              className={`text-2xl sm:text-3xl md:text-4xl font-serif text-white/95 mb-6 leading-relaxed ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              {invitationHeadline || defaultHeadline}
            </h2>

            {/* Açıklama */}
            <p 
              className={`text-lg sm:text-xl text-neutral-300 max-w-xl mx-auto leading-relaxed mb-10 font-light ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.5s' }}
            >
              {invitationDescription || defaultDescription}
            </p>

            {/* Davet Kutusu */}
            <div 
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.6s' }}
            >
              <p className="text-white/80 text-sm mb-4 font-medium tracking-wide uppercase">
                Yazar Olmak İster Misiniz?
              </p>
              <p className="text-neutral-400 text-sm mb-6">
                E-posta adresinizi bırakın, sizi aramıza davet edelim.
              </p>
              <EmailSubscriptionForm />
            </div>

            {/* İletişim & Sosyal Medya */}
            <div 
              className={`flex flex-col items-center gap-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.8s' }}
            >
              {/* İletişim E-postası */}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-primary-400 hover:text-primary-300 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {contactEmail}
                </a>
              )}

              {/* Sosyal Medya */}
              {hasSocialLinks && (
                <div className="flex items-center justify-center gap-6">
                  {invitationTwitterUrl && (
                    <a
                      href={invitationTwitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white hover-glow"
                      aria-label="X (Twitter)"
                    >
                      <XIcon className="h-6 w-6" />
                    </a>
                  )}
                  {invitationInstagramUrl && (
                    <a
                      href={invitationInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white hover-glow"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="h-6 w-6" />
                    </a>
                  )}
                  {invitationFacebookUrl && (
                    <a
                      href={invitationFacebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white hover-glow"
                      aria-label="Facebook"
                    >
                      <FacebookIcon className="h-6 w-6" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alt dekoratif gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
      </div>
    </>
  );
}
