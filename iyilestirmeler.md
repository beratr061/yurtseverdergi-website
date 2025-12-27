1. Dosya Yükleme (Upload) Kalıcılığı [En Önemli Madde]
app/api/upload/route.ts dosyanız resimleri public/uploads klasörüne kaydediyor.

Sorun: İleride projeyi güncellemek için klasörü silip tekrar GitHub'dan çekerseniz (git pull veya clean install), yüklenen tüm resimler silinir.

VDS Çözümü:

Sunucuda proje klasörünün dışında bir klasör açın: mkdir -p /var/www/yurtsever-uploads

Projenizin içindeki public/uploads klasörünü silin.

Onun yerine bir "Sembolik Link" (Kısayol) oluşturun:

Bash

ln -s /var/www/yurtsever-uploads /var/www/proje-klasoru/public/uploads
Bu sayede kodunuz public/uploads'a yazdığını sanır ama dosyalar aslında güvenli bir dış klasörde tutulur. Siteyi silip tekrar yükleseniz de resimler gitmez.

2. Next.js Konfigürasyonu (Standalone Mod)
VDS performansını artırmak için next.config.ts dosyasına şu satırı eklemenizi şiddetle öneririm:

TypeScript

const nextConfig: NextConfig = {
  output: 'standalone', // <--- BU SATIRI EKLEYİN
  // ... diğer ayarlarınız aynı kalsın
}
Neden? Bu ayar, next build aldığınızda sadece ve sadece projenin çalışması için gereken dosyaları içeren minimal bir klasör (.next/standalone) oluşturur. Bu, sunucuyu (RAM ve Disk) çok daha verimli kullanır.

3. Environment Variables (.env) Dosyası
VDS'e dosyaları attıktan sonra, proje ana dizininde .env dosyası oluşturup şunları girmelisiniz:

Kod snippet'i

# Veritabanı (VDS içinde MongoDB kuruluysa)
DATABASE_URL="mongodb://localhost:27017/yurtsever_db?replicaSet=rs0" 
# Not: Prisma MongoDB için Replica Set gerektirir, kurulumda bunu açmayı unutmayın.

# Auth Ayarları
NEXTAUTH_SECRET="buraya-rastgele-uzun-bir-sifre-yaz"
NEXTAUTH_URL="https://siteniz.com" # VDS'e bağladığınız domain

# Varsa SMTP (Mail) Ayarları
# (Davet sistemi için gerekli olabilir)
4. Build Komutu ve Prisma
package.json dosyanızda build komutu: "build": "prisma generate && next build --webpack" şeklinde.

Düzeltme: --webpack bayrağına (flag) genelde gerek yoktur, Next.js varsayılan derleyicisiyle daha iyi çalışır. Komutu "prisma generate && next build" olarak sadeleştirebilirsiniz.

Deploy Kontrol Listesi (Checklist)
[ ] VDS Hazırlığı: Node.js 20+, Nginx, MongoDB, PM2 kurulu mu?

[ ] MongoDB Replica Set: Prisma'nın çalışması için MongoDB'nin "Replica Set" modunda çalışması şarttır. (Tek sunucu olsa bile).

[ ] Upload Klasörü: Yukarıdaki sembolik link (symlink) ayarı yapıldı mı?

[ ] Build: Sunucu içinde npm run build hatasız tamamlanıyor mu?

[ ] Process: pm2 start npm --name "dergi" -- start komutuyla site ayağa kalktı mı?