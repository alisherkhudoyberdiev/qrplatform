# QR Menyu — MVP

QR asosida restoran menyusi va buyurtma tizimi (O‘zbekiston bozoriga).

## Texnologiyalar

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Backend:** Next.js API routes
- **DB:** SQLite + Prisma 7
- **Auth:** Email/parol, iron-session (session-based)

## Loyiha tuzilishi

```
src/
├── app/
│   ├── page.tsx                 # Bosh sahifa (mijoz/admin havolalari)
│   ├── layout.tsx
│   ├── menu/[restaurantId]/     # Mijoz: menyu
│   │   ├── page.tsx             #   Menyu ko‘rinishi
│   │   ├── cart/page.tsx         #   Savat + buyurtma berish
│   │   ├── status/page.tsx       #   Buyurtma holati
│   │   └── qr/page.tsx          #   QR kod (bonus)
│   ├── admin/
│   │   ├── layout.tsx           # Admin nav + auth
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── menu/page.tsx         # Kategoriya/mahsulot CRUD
│   │   ├── orders/page.tsx       # Buyurtmalar (status yangilash)
│   │   ├── LogoutButton.tsx
│   │   └── menu/MenuManager.tsx, orders/OrdersManager.tsx
│   └── api/
│       ├── restaurants/[id]/menu/   # GET menyu (public)
│       ├── orders/                  # POST buyurtma (public)
│       ├── orders/[id]/status/     # GET buyurtma holati (public)
│       └── admin/
│           ├── login, logout, me
│           ├── dashboard/
│           ├── categories/, categories/[id]/
│           ├── menu-items/, menu-items/[id]/
│           └── orders/, orders/[id]/status/
├── lib/
│   ├── prisma.ts    # Prisma client (libsql adapter)
│   ├── auth.ts      # Session (iron-session)
│   └── admin-data.ts
prisma/
├── schema.prisma   # Restaurant, Category, MenuItem, Order, OrderItem, AdminUser
└── seed.ts         # Namuna restoran + admin
```

## Ishga tushirish

```bash
# O‘rnatish
npm install

# DB yaratish va seed
npx prisma db push
npm run db:seed

# Ishga tushirish
npm run dev
```

Brauzerda:

- **Mijoz:** http://localhost:3000/menu/seed-restaurant-1
- **Admin:** http://localhost:3000/admin/login — **admin@oshxona.uz** / **admin123**
- **QR sahifa:** http://localhost:3000/menu/seed-restaurant-1/qr

## API misollari

- `GET /api/restaurants/:id/menu` — menyu (kategoriyalar + mahsulotlar)
- `POST /api/orders` — body: `{ restaurantId, items: [{ menuItemId, quantity }] }`
- `GET /api/orders/:id/status` — buyurtma holati
- Admin barcha route’lar session talab qiladi (Cookie).

## GitHubga deploy

1. **GitHubda yangi repo yarating** (masalan: `qrplatfrom-uz`).
2. **Remote qo'shing va push qiling:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/qrplatfrom-uz.git
git branch -M main
git add .
git commit -m "Deploy: CI workflow, .gitignore"
git push -u origin main
```

3. **CI:** Har bir push/pull requestda GitHub Actions build va lint ishlaydi (`.github/workflows/ci.yml`).

4. **Production hosting:** Loyiha Next.js — Vercel, Railway yoki boshqa platformaga ulashing. SQLite fayl Vercel'da qayta yoziladi; production uchun PostgreSQL yoki boshqa DB ulang. `DATABASE_URL` va `SESSION_SECRET` environment o'zgaruvchilarini o'rnating.

## Keyingi qadamlar (MVP dan tashqari)

- To‘lov (online payment)
- Push-bildirishnomalar
- Ko‘p tillik
- Batafsil analitika
