# Fan Olimpiadasi

Olimpiada savollari bilan ishlash, test yechish, xatolarni qayta ishlash va natijalarni tahlil qilish uchun React + Express + SQLite ilova.

## Yangilangan

- Professional, responsive dashboard dizayni.
- Emoji ikonlar olib tashlandi; `lucide-react` ikonlar tizimi ishlatiladi.
- Sidebar va topbar qayta ishlangan.
- Savollar bazasi uchun toza filter/search UI.
- Savol qo‘shish va tahrirlash modal oynasi yaxshilandi.
- Admin/Boshqaruv bo‘limida fan, yil/bosqich va mavzular uchun **qo‘shish + tahrirlash + o‘chirish**.
- Admin CRUD uchun yangi `PUT` API endpointlar qo‘shildi.
- Empty/error/loading holatlari yaxshilandi.
- Inline stylelar asosiy UI qismlaridan olib tashlandi va umumiy CSS tizimiga o'tkazildi.
- Test, natija, xato savollar, statistika va tahlil sahifalari yagona visual systemga moslashtirildi.
- Subject o‘chirilganda faol subject avtomatik qayta tanlanadi.

## Ishga tushirish

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

Production build:

```bash
npm run build
npm start
```

> `lucide-react` yangi dependency sifatida qo‘shilgan. Internet mavjud muhitda `npm install` uni paket registridan o‘rnatadi.
# olimpiada
