# Kegunaan & tugas tiap file — backend KAS-RT API

Dokumentasi ini melengkapi `backend-architecture-kas-rt.md`, fokus jelasin **fungsi spesifik tiap file** dalam struktur.

---

## `config/`

| File | Tugas |
|---|---|
| `prisma.ts` | Bikin **satu instance** `PrismaClient` yang dipakai di seluruh app (singleton). Tujuannya biar gak bikin koneksi baru ke database tiap kali ada request — cukup import instance ini di service manapun. |
| `env.ts` | Load `process.env` dan **validasi** variable penting (`DATABASE_URL`, `JWT_SECRET`, `PORT`, dll) pakai Zod. Kalau ada env yang kelupaan diset, app langsung error pas startup — bukan error random di tengah jalan pas user lagi pakai. |

---

## `modules/{nama-modul}/` (pola ini berulang tiap modul: `auth`, `warga`, `kas`)

| File | Tugas |
|---|---|
| `*.routes.ts` | Definisiin endpoint HTTP (`GET /warga`, `POST /kas`, dst) dan hubungin tiap endpoint ke function controller yang sesuai. **Gak ada logic apapun** di sini — cuma "peta" jalur request. |
| `*.controller.ts` | Jembatan antara HTTP request dan business logic. Ambil data dari `req.body`/`req.params`/`req.query`, panggil function di service, lalu format & kirim balik lewat `res.json()`. |
| `*.service.ts` | Tempat **business logic** sesungguhnya — query ke Prisma, hitung-hitungan, validasi rule bisnis (misal: cek saldo kas cukup sebelum penarikan). Controller gak boleh langsung query Prisma, harus lewat sini. |
| `*.schema.ts` | Zod schema buat validasi input request (body/query/params). Dipakai sama `validate.middleware.ts` sebelum request nyampe controller. |
| `*.types.ts` | TypeScript type/interface khusus modul ini, misal tipe payload request atau tipe return value dari service. |

**Contoh konkret untuk modul `kas`:**
- `kas.schema.ts` → validasi `{ jumlah: number, keterangan: string, tipe: "MASUK" | "KELUAR" }`
- `kas.service.ts` → logic hitung saldo, cegah saldo minus
- `kas.controller.ts` → terima request input transaksi, panggil service, balikin saldo terbaru

---

## `middlewares/`

| File | Tugas |
|---|---|
| `error-handler.middleware.ts` | Nangkep **semua error** yang di-throw di mana pun (termasuk custom `AppError`), format jadi response JSON yang konsisten, dan nentuin HTTP status code yang dikirim ke client. Harus jadi `app.use()` paling terakhir di `server.ts`. |
| `auth.middleware.ts` | Cek token JWT di header `Authorization`, verifikasi keasliannya, lalu attach data user (misal `req.user`) biar bisa dipakai controller/service selanjutnya. Token invalid/gak ada → langsung reject sebelum nyampe controller. |
| `validate.middleware.ts` | Middleware generic yang nerima Zod schema sebagai parameter, validasi `req.body`/`query`/`params`. Kalau gagal, langsung lempar error 400 dengan detail field yang salah — controller gak perlu validasi manual lagi. |

---

## `utils/`

| File | Tugas |
|---|---|
| `response.ts` | Helper function buat bikin format response API konsisten di semua endpoint (`{ success, message, data }`), biar gak nulis manual tiap controller. |
| `logger.ts` | Setup logging (console wrapper atau lib kayak winston/pino) buat nge-track request masuk dan error — krusial banget pas debugging di production. |

---

## `routes/index.ts`

Gabungin semua routes dari tiap modul (`auth.routes`, `warga.routes`, `kas.routes`) jadi satu router utama, yang nantinya di-mount sekali di `server.ts` lewat `app.use("/api", routes)`.

---

## `server.ts`

Entry point aplikasi. Tugasnya:
1. Setup instance Express
2. Pasang middleware global (`cors`, `express.json`)
3. Mount `routes/index.ts`
4. Pasang `error-handler.middleware.ts` (paling akhir)
5. `app.listen()` buat nyalain server

---

## `prisma/schema.prisma`

Definisi model database & relasinya (misal `model Warga`, `model TransaksiKas`) beserta field dan tipe datanya. Ini **sumber kebenaran** struktur database — dari sini Prisma generate Client yang dipakai di semua `*.service.ts`.

---

## Alur tanggung jawab singkat

```
routes        → cuma routing
controller    → handle HTTP in/out
service       → business logic + query Prisma
schema        → validasi input
middleware    → cross-cutting concern (auth, error, validasi)
```

Aturan simpel: **kalau bingung naro logic di mana, tanya dulu "ini soal HTTP atau soal bisnis?"** — HTTP masuk controller, bisnis masuk service.
