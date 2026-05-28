# Rotala

Rotala, Türkiye'de gezilen şehirleri ve şehir içindeki keşif noktalarını takip etmek için tasarlanmış mobile-first MVP'dir. Frontend mevcut React/Vite arayüzünü korur; kalıcı kullanıcı verileri artık Node.js, Express, TypeScript, MongoDB, Mongoose ve JWT tabanlı backend API'de saklanır.

## Çalıştırma

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Frontend `.env.example`:

```bash
VITE_API_URL=http://localhost:4000/api
```

Production'da Oracle Cloud sunucusunda frontend ve backend ayni domain altinda
Nginx ile yayinlanacaksa `VITE_API_URL` vermeden build alinabilir; frontend
otomatik olarak `/api` adresine istek atar. API ayri subdomain uzerindeyse
build sirasinda `VITE_API_URL=https://api.rotala.online/api` kullan.

Backend `backend/.env.example`:

```bash
PORT=4000
# Local:
# MONGODB_URI=mongodb://127.0.0.1:27017/rotala
# Atlas (örnek - şifreyi repoya yazma, sadece deploy ortamına/.env'e yaz):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/rotala?retryWrites=true&w=majority
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,capacitor://localhost,http://localhost,https://localhost,https://rotala.online,https://www.rotala.online
```

## Oracle Cloud / rotala.online

Onerilen kurulum:

- DNS `A` kaydi: `rotala.online` -> Oracle Cloud public IPv4
- DNS `A` kaydi: `www.rotala.online` -> Oracle Cloud public IPv4
- Nginx frontend'i `dist/` klasorunden servis eder.
- Nginx `/api` isteklerini backend'in calistigi porta, varsayilan olarak
  `http://127.0.0.1:4000`, proxy eder.
- Backend production `.env` icinde `CORS_ORIGIN=https://rotala.online,https://www.rotala.online`
  olacak sekilde ayarlanir.

## Backend

Backend ayrı `backend/` klasöründedir. ABP kullanılmaz. Şifreler bcrypt ile hashlenir, protected endpointler `Authorization: Bearer <token>` bekler. Kullanıcılar yalnızca kendi progress, not ve puan kayıtlarını okuyup yazabilir.

Seed komutu frontend datasındaki şehir ve gezilecek yerleri duplicate oluşturmadan upsert eder:

```bash
cd backend
npm run seed
```

## API

Auth:

- `POST /api/auth/register` `{ "email": "...", "password": "...", "displayName": "..." }`
- `POST /api/auth/login` `{ "email": "...", "password": "..." }`
- `GET /api/auth/me`

Cities:

- `GET /api/cities`
- `GET /api/cities/:cityId`

Places:

- `GET /api/places`
- `GET /api/places/:placeId`
- `GET /api/cities/:cityId/places`

Progress:

- `GET /api/me/progress`
- `POST /api/me/cities/:cityId/visited`
- `DELETE /api/me/cities/:cityId/visited`
- `POST /api/me/places/:placeId/visited`
- `DELETE /api/me/places/:placeId/visited`

Notes:

- `GET /api/me/notes`
- `GET /api/me/places/:placeId/note`
- `PUT /api/me/places/:placeId/note`
- `DELETE /api/me/places/:placeId/note`

Ratings:

- `PUT /api/me/places/:placeId/rating` `{ "rating": 1 }` ile `{ "rating": 10 }` arası
- `DELETE /api/me/places/:placeId/rating`
- `GET /api/me/ratings`
- `GET /api/places/:placeId/rating-summary`
- `GET /api/cities/:cityId/rating-summary`

## Frontend Veri Akışı

- Auth `src/services/authApi.ts` üzerinden gerçek backend ile çalışır.
- JWT token protected isteklerde Bearer token olarak gönderilir.
- Progress `src/services/progressApi.ts` ile backend'e yazılır ve sayfa yenilenince tekrar backend'den çekilir.
- Şehir/yer işaretleme artık `localStorage` veya mock state'e kalıcı yazmaz.
- Not ve puan servisleri `src/services/notesApi.ts` ve `src/services/ratingsApi.ts` içinde hazırdır.
- `localStorage` ana veri kaynağı olarak kullanılmaz; oturum tokenı sayfa yenilemelerinde aynı sekmede devam edebilmek için `sessionStorage` içinde tutulur.

## MVP Kapsamı

- E-posta/şifre auth akışı
- Gerçek GeoJSON polygon sınırlarıyla 81 il haritası
- Seçili il için gerçek ilçe polygon katmanı
- 1145 kayıtlık il/ilçe bazlı gezilecek yer dataseti
- İlçe polygonuna tıklayınca o ilçedeki gezilecek yerlerin gösterilmesi
- Gezilen şehir, Türkiye keşif ve bölge ilerleme yüzdeleri
- Mobilde bottom sheet, desktopta sağ panel şehir detayı
- İlçe bazlı accordion checklist
- MongoDB kalıcılığı, not ve puan API'leri, public ortalama puan hesapları

## Kontrol

```bash
npm run build
cd backend
npm run build
```
