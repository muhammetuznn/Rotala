Rotala - Mobile First & Responsive UI/UX Dokümanı

## 1. Amaç

Bu dokümanın amacı, mevcut **81 İz** uygulamasının mobil öncelikli, responsive, özgün ve kaliteli bir kullanıcı arayüzüne dönüştürülmesini sağlamaktır.

Uygulama standart AI tarafından üretilmiş gibi görünen jenerik dashboard, sıradan kart tasarımı veya klasik SaaS arayüzü gibi görünmemelidir.

Ana hedef:

> 81 İz, Türkiye’de gezilen şehirleri ve keşfedilen yerleri kişisel bir gezi haritası olarak takip ettiren, mobil uygulama kalitesinde, sıcak, özgün ve kullanımı kolay bir ürün gibi hissettirmelidir.

Bu çalışma yapılırken mevcut uygulama mantığı bozulmamalıdır.

Korunacak ana fonksiyonlar:

- Kullanıcı giriş / kayıt
- Türkiye haritası
- Şehir seçimi
- Şehir gezildi işaretleme
- Gezilecek yer checklist sistemi
- İlçe bazlı gruplama
- Şehir / ilçe / Türkiye yüzdesi hesaplama
- Kullanıcı yorumları
- Kullanıcı puanları
- Ortalama puan gösterimi
- Backend API entegrasyonu varsa mevcut veri akışı

---

## 2. Ana Tasarım Prensibi

Uygulama **mobile-first** geliştirilecek.

Önce mobil görünüm kusursuz hale getirilecek, sonra tablet ve desktop ekranlara responsive olarak genişletilecektir.

Yanlış yaklaşım:

```text
Önce desktop dashboard tasarlayıp sonra mobilde küçültmek.
```

Doğru yaklaşım:

```text
Önce mobilde tek elle kullanılabilir uygulama deneyimi tasarla.
Sonra tablet ve desktop için alanı daha iyi kullan.
```

Uygulama mobilde bir web sitesi gibi değil, gerçek bir mobil uygulama gibi hissettirmelidir.

---

## 3. Genel Görsel Kimlik

Tasarım dili şu kavramları taşımalıdır:

- Türkiye
- Gezi
- Harita
- İz bırakma
- Keşif
- Kişisel rota
- Tamamlama hissi
- Sıcak ama modern görünüm

Tasarım şu görüntüye düşmemelidir:

- Admin panel gibi
- Kurumsal dashboard gibi
- Jenerik mavi-mor AI arayüzü gibi
- Fazla düz ve ruhsuz
- Rastgele kartlardan oluşan panel gibi
- Harita uygulaması yerine Excel tablosu gibi
- Her yerde aynı yuvarlak beyaz kartlar
- Gereksiz emoji kalabalığı

---

## 4. Renk Paleti Yönü

Renkler Türkiye, doğa ve seyahat hissine uygun olmalıdır.

Önerilen renk hissi:

```text
Kırık beyaz / sıcak kum tonu: ana arka plan
Zeytin yeşili: gezildi / doğal vurgu
Derin turkuaz veya deniz mavisi: ana marka rengi
Gün batımı turuncusu: sıcak vurgu
Altın: tamamlandı / %100
Yumuşak gri: gidilmedi
```

Şehir renk mantığı:

```text
Gidilmedi: yumuşak gri
Gezildi: açık doğal yeşil
%50 üzeri keşif: güçlü yeşil
%100 tamamlandı: altın
Planlandı / gitmek istiyorum: deniz mavisi
Hata: yumuşak kırmızı
Başarı: yeşil
```

Dark mode varsa siyah arka plan yerine koyu lacivert, koyu orman yeşili veya koyu antrasit gibi karakterli tonlar kullanılmalıdır.

---

## 5. Tipografi

Önerilen fontlar:

- Inter
- Manrope
- Plus Jakarta Sans
- Sora
- Nunito Sans

Kurallar:

- Başlıklar güçlü ama abartısız olmalı.
- Gövde metni mobilde rahat okunmalı.
- Yüzde değerleri büyük ve dikkat çekici olmalı.
- Yardımcı açıklamalar daha yumuşak kontrastla gösterilmeli.
- Çok küçük yazı kullanılmamalı.
- Buton yazıları minimum 14px olmalı.

Öneri:

```text
Ana yüzde: 32px - 44px
Sayfa başlığı: 22px - 28px
Kart başlığı: 16px - 20px
Normal metin: 14px - 16px
Yardımcı metin: 12px - 14px
```

---

## 6. Responsive Breakpoint Kuralları

Uygulama aşağıdaki ekran genişliklerinde düzgün çalışmalıdır:

```text
360px  - küçük mobil
375px  - iPhone standart
390px  - modern iPhone
414px  - büyük mobil
430px  - büyük Android / iPhone Pro Max
768px  - tablet
1024px - küçük laptop / tablet yatay
1280px - desktop
1440px - geniş desktop
```

Tailwind kullanılıyorsa mobile-first sınıflar tercih edilmelidir.

Örnek:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
```

---

## 7. Mobil Ana Sayfa Düzeni

Mobil ana sayfa tek kolon olmalıdır.

Sıralama:

```text
1. Üst karşılama alanı
2. Büyük Türkiye ilerleme kartı
3. Türkiye haritası
4. Bölge bazlı ilerleme alanı
5. Son işaretlenen yerler
6. Sıradaki keşif / öneri kartı
```

Mobilde kullanıcı uygulamayı açınca 3 saniyede şunları anlamalıdır:

- Kaç şehir gezdim?
- Türkiye’nin yüzde kaçını gezdim?
- Haritada hangi iller işaretli?
- Sırada ne yapabilirim?

---

## 8. Üst Karşılama Alanı

Üst alan klasik, düz navbar gibi görünmemelidir.

Örnek:

```text
81 İz
Türkiye Gezi Haritan

Merhaba Muhammet
Bugün haritanda yeni bir iz bırak.
```

Mobilde önerilen yapı:

```text
Sol: 81 İz logo / metin
Alt: kısa açıklama
Sağ: profil butonu
```

Profil butonu küçük ama erişilebilir olmalıdır. Kullanıcının uzun e-posta adresi header içinde gösterilmemelidir.

---

## 9. Ana İlerleme Kartı

Bu kart uygulamanın motivasyon merkezi olmalıdır.

Örnek içerik:

```text
Türkiye’nin %28’ini gezdin

23 / 81 şehir
146 / 1746 yer tamamlandı
```

Tasarım kuralları:

- Büyük yüzde öne çıkmalı.
- Sıradan dashboard kartı gibi görünmemeli.
- Kartta hafif harita konturu / rota çizgisi / iz dokusu olabilir.
- Progress bar veya progress ring kullanılabilir.
- Kart sıcak, premium ve sade görünmeli.
- Aşırı gradient kullanılmamalı.

Mikro metinler:

```text
Haritanda yeni bir iz bırak.
Keşif devam ediyor.
Türkiye haritan yavaş yavaş doluyor.
```

---

## 10. Türkiye Haritası Mobil Tasarımı

Türkiye haritası uygulamanın ana görselidir.

Kurallar:

- Harita gerçek il sınırlarıyla çizilmiş olmalıdır.
- Harita noktalı / marker tabanlı sahte harita gibi görünmemelidir.
- Mobilde container içine tam oturmalıdır.
- Yatay scroll oluşturmamalıdır.
- Şehir tıklama alanları parmakla kullanılabilir olmalıdır.
- Seçili şehir net highlight almalıdır.
- Gezilen şehirler renkle anlaşılmalıdır.
- Gidilmeyen şehirler yumuşak gri kalmalıdır.
- Çok ince sınırlar kullanılmamalıdır.

Mobilde küçük illeri seçmek zor olursa harita altına destekleyici şehir seçici eklenmelidir:

```text
Şehir ara veya seç
[ Antalya ▼ ]
```

---

## 11. Şehir Detay Bottom Sheet

Mobilde şehir detayları sağdan açılmamalıdır.

Mobilde şehir detayları **bottom sheet** olarak alttan açılmalıdır.

Davranış:

```text
Şehre tıklanınca alttan detay paneli açılır.
Panel ekranın %80 - %90 yüksekliğini kaplayabilir.
Panel içeriği kendi içinde scroll olur.
Harita arka planda kalır.
Panel kapatılabilir.
```

Örnek üst bölüm:

```text
────
Antalya
Akdeniz Bölgesi

Gezildi
Şehir keşfi: %22
4 / 18 yer tamamlandı
```

Bottom sheet içerikleri:

- Şehir adı
- Bölge adı
- Gezildi durumu
- Şehir keşif yüzdesi
- “Bu şehre gittim” butonu
- İlçe bazlı ilerleme
- Gezilecek yer checklist’i
- Not ve puan alanları

---

## 12. Şehir Detay Görünümü

Şehir detay görünümü sadece liste gibi olmamalıdır.

Örnek:

```text
Antalya
Akdeniz Bölgesi

Gezildi ✅
Keşif: %22
4 / 18 yer

Bu şehirde ilk izin bırakıldı.
```

Şehir durum mikro metinleri:

```text
Henüz gidilmedi
İlk iz bırakıldı
Keşif devam ediyor
Yarıdan fazlası keşfedildi
Şehir tamamlandı
```

---

## 13. İlçe Bazlı Accordion Tasarımı

Gezilecek yerler ilçe ilçe gruplanmalıdır.

Mobilde ilçeler accordion olarak açılıp kapanabilir olmalıdır.

Örnek:

```text
Kaş
2 / 5 tamamlandı    %40

☑ Kaputaş Plajı
☐ Patara Antik Kenti
☐ Kekova
```

İlçe başlığı şunları göstermelidir:

- İlçe adı
- Gezilen yer / toplam yer
- İlçe yüzde oranı
- İnce progress bar

---

## 14. Gezilecek Yer Satırı Tasarımı

Her gezilecek yer satırı sade ama bilgi dolu olmalıdır.

Örnek:

```text
Kaputaş Plajı
Kaş · Plaj · Mutlaka Gör

Benim puanım: 9
Genel: 8.7 · 124 oy
```

Satırda bulunabilecek bilgiler:

- Özel checkbox
- Yer adı
- İlçe
- Kategori
- Öncelik etiketi
- Kullanıcının kendi puanı
- Genel ortalama puan
- Not var/yok göstergesi

Satır kuralları:

- Minimum yükseklik 48px olmalı.
- Sadece checkbox değil, satırın tamamı tıklanabilir olmalı.
- Uzun yer adları taşmamalı, satır kırmalıdır.
- Varsayılan HTML checkbox kullanılmamalı; tasarıma uygun özel checkbox yapılmalı.
- İşaretlenince küçük ama tatmin edici bir animasyon olabilir.

Öncelik etiketleri:

```text
must_see     -> Mutlaka Gör
recommended  -> Önerilir
hidden_gem   -> Saklı Rota
```

---

## 15. Not ve Puan Bottom Sheet / Modal

Fotoğraf yükleme olmayacak.

İlk etapta not ve puan sistemi olacak.

Alanlar:

```text
Benim yorumum
[ kısa yorum alanı ]

Puanım
[ 1 2 3 4 5 6 7 8 9 10 ]

Tekrar gider miyim?
[ Evet / Hayır ]

Kaydet
```

Kurallar:

- Mobilde form çok uzun olmamalı.
- Puan seçimi klasik select gibi görünmemeli.
- 1-10 arası chip/rating butonları kullanılabilir.
- Not alanı maksimum 1000 karakter olmalıdır.
- Kişisel not private kalır.
- Ortalama puan public gösterilir.

---

## 16. Login / Register Mobil Tasarımı

Login/register ekranı standart form gibi görünmemelidir.

Örnek layout:

```text
81 İz
Gezdiğin şehirleri kaydet, Türkiye haritanı tamamla.

[E-posta]
[Şifre]

[Giriş Yap]

Hesabın yok mu? Kayıt ol
```

Kurallar:

- Mobilde form tam genişliğe yakın olmalı.
- Inputlar büyük ve rahat olmalı.
- Butonlar tam genişlikte olmalı.
- Klavye açıldığında form kullanılabilir kalmalı.
- Hata mesajları net olmalı.
- Arka planda hafif harita / rota / pusula dokusu olabilir.
- Şifre veya kullanıcı bilgisi localStorage’da tutulmamalıdır.

Desktopta form maksimum 420px genişliğinde ortalanmış kart olabilir.

---

## 17. Bottom Navigation

Mobil uygulama hissi için basit bottom navigation kullanılabilir.

Önerilen sekmeler:

```text
Harita
İlerleme
Profil
```

Kullanılırsa:

- iPhone safe area desteklenmeli.
- Fazla yüksek olmamalı.
- Aktif sekme belirgin olmalı.
- Harita alanını boğmamalı.
- Gereksiz yeni sayfa oluşturmamalı.

Safe area desteği:

```css
padding-bottom: env(safe-area-inset-bottom);
```

---

## 18. Tablet Responsive Davranışı

Tablet dikey:

```text
Tek kolon veya geniş tek kolon
Harita büyük
Kartlar 2 kolon olabilir
Bottom sheet kullanılabilir
```

Tablet yatay:

```text
Harita sol/üst merkezde
İstatistikler 2 kolon
Şehir detayı sağ panel veya geniş bottom sheet
```

Tablet ekranlarda uygulama boşlukları iyi kullanmalı ama desktop dashboard hissine dönüşmemelidir.

---

## 19. Desktop Responsive Davranışı

Desktop görünümde alan daha verimli kullanılmalıdır.

Önerilen yapı:

```text
Sol / orta: Türkiye haritası
Sağ: Genel ilerleme, bölge ilerlemeleri, seçili şehir özeti
```

Desktopta şehir detayları:

- Sağ panel olarak açılabilir.
- Panel sabit genişlikte olabilir.
- Harita alanı küçülmemelidir.
- Container maksimum genişliğe sahip olmalıdır.

Öneri:

```text
max-width: 1280px veya 1440px
margin: 0 auto
```

Desktopta da tasarım mobil uygulama kimliğini korumalıdır.

---

## 20. Kart ve Grid Responsive Kuralları

Kartlar ekran boyutuna göre kolon değiştirmelidir.

```text
Mobil: 1 kolon
Büyük mobil: 1 kolon
Tablet: 2 kolon
Desktop: 2 veya 3 kolon
```

Tailwind örneği:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

Ana layout örneği:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
```

---

## 21. Spacing Kuralları

Responsive padding:

```text
Mobil: 16px
Tablet: 24px
Desktop: 32px
```

Tailwind örneği:

```tsx
<div className="px-4 md:px-6 lg:px-8">
```

---

## 22. Touch ve Erişilebilirlik Kuralları

Minimum dokunma alanı:

```text
44px - 48px
```

Bu kurala uyması gerekenler:

- Harita şehir seçimi
- Butonlar
- Checkbox satırları
- Accordion başlıkları
- Profil menüsü
- Bottom sheet kapatma
- Puan chipleri
- Bottom navigation itemları

Erişilebilirlik:

- Butonlarda `aria-label` kullanılmalı.
- Renk tek başına anlam taşımamalı.
- Kontrast yeterli olmalı.
- Form hata mesajları net olmalı.

---

## 23. Animasyon ve Mikro Etkileşimler

Kullanılabilir animasyonlar:

- Şehir seçilince yumuşak highlight
- Bottom sheet yumuşak açılış
- Checkbox işaretlenince küçük başarı hissi
- Progress bar güncellenirken hafif animasyon
- Kartlar ilk yüklemede hafif fade/slide

Kaçınılacaklar:

- Gereksiz confetti
- Aşırı bounce
- Sürekli hareket eden gradient
- Performansı düşüren animasyonlar
- Her tıklamada abartılı efekt

---

## 24. Loading / Error / Empty State

Loading:

- Skeleton tercih edilebilir.
- Her yerde spinner kullanılmamalıdır.
- Harita yüklenirken boş beyaz alan kalmamalıdır.

Error örneği:

```text
Veriler alınamadı.
Bağlantını kontrol edip tekrar dene.
```

Empty state örnekleri:

```text
Henüz haritanda iz yok.
İlk şehrini seç ve Türkiye haritanı tamamlamaya başla.
```

```text
Henüz puan yok.
İlk puanı sen ver.
```

```text
Bu yerle ilgili kendi notunu ekleyebilirsin.
```

---

## 25. AI Görünümünden Kaçınma Kuralları

Yapılmayacaklar:

- Jenerik mavi-mor gradient
- Rastgele emoji kullanımı
- Her şeyi aynı cam kart içine koymak
- Standart admin panel layout’u
- Sıradan SaaS dashboard görünümü
- Gereksiz 3D ikonlar
- Bootstrap havası
- Aşırı parlak renkler
- Aynı kart grid’ini her yere basmak

Özgün detaylar:

- Türkiye harita konturu
- İz / rota çizgisi hissi
- Pusula veya yol işareti gibi minimal ikonlar
- Plaka kodlarını küçük tasarım detayı olarak kullanmak
- “İz bırakıldı”, “Keşif devam ediyor”, “Tamamlandı” gibi uygulama dili
- Bölge renklerinde doğal tonlar

---

## 26. Ortak UI Componentleri

Önerilen componentler:

```text
AppCard
ProgressBar
ProgressRing
StatPill
PriorityBadge
RatingChips
CustomCheckbox
BottomSheet
EmptyState
LoadingSkeleton
ErrorState
RegionProgressCard
CityStatusBadge
```

Mevcut componentlerde özellikle iyileştirilecekler:

```text
AppHeader
LoginForm
RegisterForm
ProgressSummary
TurkeyMap
CityDetailPanel
DistrictProgressList
PlaceChecklist
PlaceRating
PlaceNote
RegionProgress
ProfileMenu
BottomNavigation
```

---

## 27. Performans Kuralları

Mobil performans önceliklidir.

Kurallar:

- Ağır harita kütüphanesi eklenmemeli.
- SVG/GeoJSON harita optimize kullanılmalı.
- Gereksiz animasyonlardan kaçınılmalı.
- Gereksiz re-render azaltılmalı.
- Uzun checklist listelerinde componentler sade tutulmalı.
- API istekleri gereksiz tekrarlanmamalı.
- Kullanıcı progress’i tek seferde çekilip state’e alınabilir.
- Büyük görsel kullanılmamalı.

---

## 28. Responsive Test Kabul Kriterleri

Aşağıdaki genişliklerde manuel test yapılmalıdır:

```text
360px
375px
390px
414px
430px
768px
1024px
1280px
1440px
```

Her genişlikte kontrol edilecekler:

1. Yatay scroll oluşmuyor.
2. Login ekranı bozulmuyor.
3. Register ekranı bozulmuyor.
4. Ana ilerleme kartı okunabilir.
5. Harita container içinde kalıyor.
6. Harita şehir seçimi çalışıyor.
7. Mobilde şehir detayı bottom sheet açılıyor.
8. Desktopta şehir detayı sağ panel veya uygun geniş panel olarak açılıyor.
9. Checklist satırları taşmıyor.
10. Uzun yer adları düzgün kırılıyor.
11. Not/puan modalı mobilde kullanılabilir.
12. Bottom navigation varsa safe area düzgün.
13. Header mobilde sıkışmıyor.
14. Kartlar tablet/desktopta doğru kolonlanıyor.
15. Tasarım admin panel gibi görünmüyor.
16. Tasarım standart AI önyüzü gibi görünmüyor.

---

## 29. Codex İçin Net Uygulama Talimatı

Mevcut 81 İz projesini incele.

Mevcut çalışan iş mantığını, backend entegrasyonunu ve component akışını bozmadan UI/UX’i mobile-first ve responsive olarak geliştir.

Uygulama standart AI dashboard tasarımı gibi görünmemeli. Türkiye gezi haritası, keşif, iz bırakma ve kişisel rota hissi taşıyan özgün bir mobil uygulama tasarımı yapılmalı.

Öncelikler:

```text
1. Mobil görünüm
2. Responsive davranış
3. Özgün görsel kimlik
4. Harita kullanılabilirliği
5. Bottom sheet şehir detayı
6. İlçe accordion checklist
7. Not ve puan deneyimi
8. Login/register kalitesi
9. Loading/error/empty state
```

Korunacaklar:

```text
Mevcut fonksiyonlar
Mevcut veri akışı
Mevcut backend endpointleri
Mevcut progress hesaplama mantığı
Mevcut harita/şehir/yer datası
```

Değiştirilebilecekler:

```text
Layout
Renkler
Typography
Component görünümleri
Kart tasarımları
Bottom sheet davranışı
Mobil navigasyon
Responsive grid
Micro interaction
```

Yapılmayacaklar:

```text
Backend endpointlerini keyfi değiştirme
Veri modelini bozma
Fotoğraf upload ekleme
Sosyal medya özelliği ekleme
Admin panel ekleme
Gereksiz yeni sayfa ekleme
Ağır harita kütüphanesi ekleme
Mevcut çalışan fonksiyonları kırma
```

---

## 30. Kısa Codex Promptu

Aşağıdaki kısa prompt doğrudan Codex’e verilebilir:

```text
Mevcut 81 İz projesini analiz et ve çalışan fonksiyonları bozmadan uygulamayı mobile-first ve responsive bir tasarıma taşı.

Tasarım standart AI dashboard gibi görünmesin. Türkiye gezi haritası, keşif, iz bırakma ve kişisel rota hissi veren özgün, sıcak, modern ve mobil uygulama kalitesinde bir UI oluştur.

Önce 360px - 430px mobil ekranlarda kusursuz çalışacak şekilde tasarla. Sonra 768px tablet, 1024px+ desktop için responsive düzen kur.

Mobilde:
- Ana sayfa tek kolon olacak.
- Üstte karşılama alanı olacak.
- Büyük Türkiye ilerleme kartı olacak.
- Türkiye haritası yatay scroll yapmadan sığacak.
- Şehir detayları sağ panel değil bottom sheet olarak alttan açılacak.
- İlçeler accordion olarak listelenecek.
- Checklist satırları minimum 48px yüksekliğinde olacak.
- Not ve puan ekleme mobil bottom sheet/modal ile yapılacak.
- Login/register ekranı mobil uygulama kalitesinde olacak.

Desktopta:
- Harita ana alanda kalacak.
- Sağda istatistik/seçili şehir paneli olabilir.
- Container maksimum 1280px/1440px genişlikte kalacak.
- Tasarım desktop dashboard gibi sıkıcı görünmeyecek.

Renk paleti sıcak ve gezi hissi vermeli:
kırık beyaz, zeytin yeşili, derin turkuaz, gün batımı turuncusu, altın vurgu.

Jenerik mavi-mor gradient, sıradan admin panel kartları, rastgele emoji ve standart AI UI görünümünden kaçın.

Mevcut backend endpointlerini, veri modelini, progress hesaplamalarını ve iş mantığını bozma. Sadece UI/UX, responsive layout, component görünümü ve mobil kullanım deneyimini iyileştir.
```

---

## 31. Final Kabul Kriterleri

Bu mobile UI çalışması tamamlandı sayılması için:

1. Uygulama mobilde gerçek mobil uygulama gibi hissettirmeli.
2. 360px genişlikte yatay scroll olmamalı.
3. 430px genişliğe kadar mobil görünüm çok iyi çalışmalı.
4. Tablet görünüm düzgün olmalı.
5. Desktop görünüm düzgün olmalı.
6. Harita mobilde kullanılabilir olmalı.
7. Şehir detayları mobilde bottom sheet olmalı.
8. Checklist satırları parmakla rahat kullanılmalı.
9. Not ve puan akışı mobilde rahat olmalı.
10. Login/register ekranları özgün ve kaliteli görünmeli.
11. Tasarım admin panel gibi görünmemeli.
12. Tasarım standart AI önyüzü gibi görünmemeli.
13. Türkiye/gezi/iz/rota kimliği uygulamanın her yerinde hissedilmeli.
14. Mevcut iş mantığı ve backend entegrasyonu bozulmamalı.
