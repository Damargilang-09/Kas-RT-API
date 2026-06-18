# Backend architecture — KAS-RT API

Rekomendasi struktur project untuk backend Express.js + TypeScript + Prisma, modular per fitur (feature-based), biar enak dikerjain bareng 2-3 orang tanpa sering conflict.

## Tech stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- Zod (validasi input)
- JWT (kalau butuh auth)

## Struktur folder

```
src/
├── config/
│   ├── prisma.ts            # instance Prisma client
│   └── env.ts                # load & validasi environment variable
│
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts    # zod schema buat validasi request
│   │   └── auth.types.ts
│   │
│   ├── warga/                 # contoh modul: data warga
│   │   ├── warga.routes.ts
│   │   ├── warga.controller.ts
│   │   ├── warga.service.ts
│   │   ├── warga.schema.ts
│   │   └── warga.types.ts
│   │
│   └── kas/                   # contoh modul: transaksi kas RT
│       ├── kas.routes.ts
│       ├── kas.controller.ts
│       ├── kas.service.ts
│       ├── kas.schema.ts
│       └── kas.types.ts
│
├── middlewares/
│   ├── error-handler.middleware.ts
│   ├── auth.middleware.ts
│   └── validate.middleware.ts
│
├── utils/
│   ├── response.ts            # format response API standar
│   └── logger.ts
│
├── routes/
│   └── index.ts                # gabungin semua routes per modul
│
└── server.ts                   # entry point Express app

prisma/
├── schema.prisma
└── migrations/
```

## Tanggung jawab tiap layer (per modul)

| File | Tugas |
|---|---|
| `*.routes.ts` | Daftarin endpoint, hubungin ke controller. Gak ada logic di sini. |
| `*.controller.ts` | Terima request/response, panggil service, return response standar. |
| `*.service.ts` | Business logic — query ke Prisma, olah data. |
| `*.schema.ts` | Zod schema buat validasi body/query/params. |
| `*.types.ts` | TypeScript type/interface khusus modul ini. |

## Alur request

```
Client → routes → validate middleware → controller → service → Prisma → DB
DB → service → controller → format response standar → Client
```

## Format response standar

```ts
{
  success: boolean,
  message: string,
  data?: any,
  error?: any
}
```

## Error handling

Centralized lewat `error-handler.middleware.ts`. Bikin custom error class biar bisa bawa `statusCode`:

```ts
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
```

Service/controller tinggal `throw new AppError(404, "Data tidak ditemukan")`, middleware yang tangkep & format response-nya.

## Naming convention

- Nama file: `nama-fitur.layer.ts` (contoh: `kas.controller.ts`)
- Nama folder modul: lowercase, sesuai domain (`auth`, `warga`, `kas`)
- Function & variable: camelCase
- Model Prisma: PascalCase singular (`Warga`, `TransaksiKas`)

## Kenapa struktur ini

- **Modular per fitur** — gampang nambah fitur baru tanpa ganggu fitur lain. Cocok buat tim 2-3 orang: masing-masing bisa pegang satu modul (misal satu orang fokus `auth` & `warga`, satu orang fokus `kas`) biar jarang nyentuh file yang sama.
- **Separation of concern jelas** — routes cuma routing, controller cuma handle HTTP, service isi business logic. Gampang ditest & ditrace kalau ada bug.
- **Scalable** — kalau project makin gede, tinggal nambah folder modul baru di `modules/`, gak perlu restrukturisasi total.
