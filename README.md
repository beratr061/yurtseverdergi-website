<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
</p>

<h1 align="center">📚 YurtSever Dergi</h1>

<p align="center">
  <strong>Edebiyat ve kültür dünyasının dijital yuvası</strong>
</p>

<p align="center">
  Şiir, deneme, eleştiri ve söyleşilerin buluştuğu modern bir edebiyat platformu.
</p>

---

## ✨ Öne Çıkan Özellikler

### 📝 İçerik Yönetimi
- **Zengin Metin Editörü** - Şiir ve yazılar için özelleştirilmiş editör
- **Kategori Sistemi** - Şiir, Poetika, Söyleşi, Eleştiri kategorileri
- **Taslak & Yayın** - İçerik onay akışı ile kalite kontrolü
- **Versiyon Geçmişi** - Yazı değişikliklerini takip edin

### 👥 Kullanıcı Sistemi
- **Çoklu Rol Desteği** - Admin, Yazar, Şair rolleri
- **Yazar Profilleri** - Biyografi, sosyal medya, avatar
- **Yazar Gizliliği** - Belirli tarihe kadar yazar ismini gizleme

### 🎨 Modern Arayüz
- **Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- **Dark/Light Mode** - Göz yormayan tema seçenekleri
- **Animasyonlar** - Akıcı sayfa geçişleri
- **SEO Optimizasyonu** - Arama motorlarında üst sıralarda

### 🔧 Admin Paneli
- **Dashboard** - İstatistikler ve özet bilgiler
- **Medya Kütüphanesi** - Görsel yönetimi ve optimizasyonu
- **Aktivite Logları** - Tüm işlemlerin kaydı
- **Bildirim Sistemi** - Anlık bildirimler

### 🚀 Özel Modlar
- **Davet Modu** - Site açılış öncesi yazar toplama sayfası
- **Bakım Modu** - Geçici kapatma ekranı
- **E-posta Aboneliği** - Lansman bildirimleri

---

## 🛠️ Teknoloji Stack

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Dil** | TypeScript |
| **Veritabanı** | MongoDB |
| **ORM** | Prisma |
| **Kimlik Doğrulama** | NextAuth.js v5 (Beta) |
| **Stil** | Tailwind CSS |
| **İkonlar** | Lucide React |
| **Test** | Vitest + Testing Library |

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- MongoDB veritabanı (Atlas veya self-hosted)
- npm veya yarn

### Kurulum

```bash
# 1. Repoyu klonlayın
git clone https://github.com/beratr061/yurtseverdergi-website.git
cd yurtseverdergi-website

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini ayarlayın
cp .env.example .env
```

### Ortam Değişkenleri

`.env` dosyasını düzenleyin:

```env
# Veritabanı (MongoDB)
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/yurtsever?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Upstash Redis (Rate Limiting için - opsiyonel)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

### Veritabanı Kurulumu

```bash
# Şemayı uygula
npx prisma db push

# (Opsiyonel) Örnek veriler ekle
npx prisma db seed
```

### Çalıştırma

```bash
# Geliştirme
npm run dev

# Production build
npm run build
npm start
```

🌐 Tarayıcıda açın: `http://localhost:3000`

---

## 📁 Proje Yapısı

```
yurtseverdergi-website/
├── 📂 app/
│   ├── 📂 (public)/          # Public sayfalar
│   │   ├── 📂 [category]/    # Dinamik kategori sayfaları
│   │   ├── 📂 yazar/         # Yazar profilleri
│   │   ├── 📂 yazi/          # Yazı detay sayfaları
│   │   └── 📂 invitation/    # Davet sayfası
│   ├── 📂 admin/             # Admin paneli
│   │   ├── 📂 (auth)/        # Login sayfası
│   │   └── 📂 (dashboard)/   # Dashboard sayfaları
│   └── 📂 api/               # API endpoints
├── 📂 components/
│   ├── 📂 admin/             # Admin bileşenleri
│   └── *.tsx                 # Genel bileşenler
├── 📂 lib/                   # Yardımcı fonksiyonlar
├── 📂 prisma/                # Veritabanı şeması
├── 📂 public/                # Statik dosyalar
├── 📂 tests/                 # Test dosyaları
└── 📂 types/                 # TypeScript tipleri
```

---

## 🔐 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Admin** | Tam yetki - Tüm içerik, kullanıcı ve ayar yönetimi |
| **Writer** | Yazı oluşturma, düzenleme, onaya gönderme |
| **Poet** | Şiir oluşturma, düzenleme, onaya gönderme |

---

## 📸 Ekran Görüntüleri

<details>
<summary>🖼️ Görüntülemek için tıklayın</summary>

### Ana Sayfa
Modern ve şık tasarım ile öne çıkan içerikler

### Admin Dashboard
İstatistikler ve hızlı erişim paneli

### Yazı Editörü
Zengin metin düzenleme özellikleri

</details>

---

## 🧪 Testler

```bash
# Tüm testleri çalıştır
npm test

# Watch modunda
npm run test:watch

# Coverage raporu
npm run test:coverage
```

---

## 📦 Scripts

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm start` | Production sunucusu |
| `npm run lint` | ESLint kontrolü |
| `npm test` | Testleri çalıştır |
| `npx prisma studio` | Veritabanı arayüzü |

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📧 İletişim

<p align="center">
  <a href="mailto:dergiyurtsever@gmail.com">
    <img src="https://img.shields.io/badge/Email-dergiyurtsever%40gmail.com-red?style=for-the-badge&logo=gmail" alt="Email" />
  </a>
  <a href="https://instagram.com/yurtseverdergi">
    <img src="https://img.shields.io/badge/Instagram-@yurtseverdergi-E4405F?style=for-the-badge&logo=instagram" alt="Instagram" />
  </a>
  <a href="https://youtube.com/@YurtseverDergi">
    <img src="https://img.shields.io/badge/YouTube-@YurtseverDergi-FF0000?style=for-the-badge&logo=youtube" alt="YouTube" />
  </a>
</p>

---

## 📄 Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

---

<p align="center">
  <strong>YurtSever Dergi</strong> ile edebiyatın dijital geleceğine hoş geldiniz 📖✨
</p>
