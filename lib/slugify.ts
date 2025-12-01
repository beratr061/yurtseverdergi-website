/**
 * Türkçe karakterleri koruyarak slug oluşturur
 * @param text - Slug'a dönüştürülecek metin
 * @returns URL-safe slug (Türkçe karakterlerle)
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        // Boşlukları tire ile değiştir
        .replace(/\s+/g, '-')
        // Özel karakterleri kaldır (Türkçe karakterler hariç)
        .replace(/[^\wçğıöşüÇĞİÖŞÜ-]/g, '')
        // Birden fazla tireyi tek tireye indir
        .replace(/-+/g, '-')
        // Başta ve sonda tire varsa kaldır
        .replace(/^-+|-+$/g, '');
}

/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirerek slug oluşturur
 * (Eski yöntem - geriye dönük uyumluluk için)
 */
export function slugifyLatin(text: string): string {
    const turkishMap: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    };

    return text
        .split('')
        .map(char => turkishMap[char] || char)
        .join('')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Slug'ın benzersiz olup olmadığını kontrol eder
 * Eğer slug zaten varsa sonuna sayı ekler
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
