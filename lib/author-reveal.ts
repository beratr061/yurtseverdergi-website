/**
 * Yazar Açıklama Helper Fonksiyonları
 */

export interface RevealTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

/**
 * Yazarın açıklanıp açıklanmadığını kontrol eder
 */
export function isAuthorRevealed(article: any): boolean {
  // Reveal date yoksa (eski yazılar) hemen göster
  if (!article.authorRevealDate) return true;
  
  // Şu anki zaman reveal date'den sonraysa göster
  return new Date() >= new Date(article.authorRevealDate);
}

/**
 * Reveal date'e kalan süreyi hesaplar
 */
export function getRevealTimeRemaining(revealDate: string | Date): RevealTimeRemaining | null {
  const now = new Date().getTime();
  const reveal = new Date(revealDate).getTime();
  const diff = reveal - now;

  // Süre geçmişse null döndür
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalMs: diff };
}

/**
 * Kalan süreyi okunabilir formata çevirir
 */
export function formatRevealTime(time: RevealTimeRemaining): string {
  const parts: string[] = [];
  
  if (time.days > 0) parts.push(`${time.days} gün`);
  if (time.hours > 0) parts.push(`${time.hours} saat`);
  if (time.minutes > 0) parts.push(`${time.minutes} dakika`);
  if (time.seconds > 0 && time.days === 0) parts.push(`${time.seconds} saniye`);
  
  return parts.join(' ') || '0 saniye';
}

/**
 * Kısa format (mobil için)
 */
export function formatRevealTimeShort(time: RevealTimeRemaining): string {
  const parts: string[] = [];
  
  if (time.days > 0) parts.push(`${time.days}g`);
  if (time.hours > 0) parts.push(`${time.hours}s`);
  if (time.minutes > 0) parts.push(`${time.minutes}d`);
  
  return parts.join(' ') || `${time.seconds}sn`;
}

/**
 * Yazar bilgisini gizler veya gösterir
 */
export function getAuthorDisplay(article: any) {
  const revealed = isAuthorRevealed(article);
  
  if (revealed) {
    return {
      revealed: true,
      author: article.author,
      revealDate: article.authorRevealDate,
    };
  }
  
  return {
    revealed: false,
    author: null,
    revealDate: article.authorRevealDate,
    timeRemaining: article.authorRevealDate 
      ? getRevealTimeRemaining(article.authorRevealDate)
      : null,
  };
}
