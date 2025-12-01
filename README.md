# YurtSever Dergi

Edebiyat ve kültür dergisi için modern bir web platformu.

## 🚀 Özellikler

- **Şiir & Yazı Yayınlama** - Şiir, deneme, eleştiri ve söyleşi kategorilerinde içerik yönetimi
- **Yazar Paneli** - Yazarlar için özel içerik yönetim arayüzü
- **Admin Paneli** - Tam kapsamlı yönetim sistemi
- **Davet Modu** - Site açılış öncesi yazar davet sayfası
- **Responsive Tasarım** - Mobil uyumlu modern arayüz
- **Dark/Light Mode** - Tema desteği
- **SEO Optimizasyonu** - Arama motoru dostu yapı

## 🛠️ Teknolojiler

- **Framework:** Next.js 15 (App Router)
- **Dil:** TypeScript
- **Veritabanı:** PostgreSQL + Prisma ORM
- **Kimlik Doğrulama:** NextAuth.js
- **Stil:** Tailwind CSS
- **Test:** Vitest

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env

# Veritabanını oluştur
npx prisma db push

# Seed verilerini ekle (opsiyonel)
npx prisma db seed

# Geliştirme sunucusunu başlat
npm run dev
```

## 🔧 Ortam Değişkenleri

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 📁 Proje Yapısı

```
├── app/                  # Next.js App Router
│   ├── (public)/        # Public sayfalar
│   ├── admin/           # Admin paneli
│   └── api/             # API routes
├── components/          # React bileşenleri
├── lib/                 # Yardımcı fonksiyonlar
├── prisma/              # Veritabanı şeması
└── public/              # Statik dosyalar
```

## 🔐 Kullanıcı Rolleri

- **Admin** - Tam yetki
- **Writer** - Yazı oluşturma ve düzenleme
- **Poet** - Şiir oluşturma ve düzenleme

## 📝 Lisans

Bu proje özel kullanım içindir.

## 📧 İletişim

- **E-posta:** dergiyurtsever@gmail.com
- **Instagram:** [@yurtseverdergi](https://instagram.com/yurtseverdergi)
- **YouTube:** [@YurtseverDergi](https://youtube.com/@YurtseverDergi)
