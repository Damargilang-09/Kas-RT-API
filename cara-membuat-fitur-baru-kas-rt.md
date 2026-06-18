# Langkah-langkah membuat fitur baru — KAS-RT API

Checklist & contoh konkret bikin modul baru, konsisten sama struktur `modules/` dan pola error handling (`AppError` + `http-status-codes`) yang udah dibahas sebelumnya.

Contoh kasus dipakai di sini: bikin fitur **iuran** (catatan iuran bulanan warga).

---

## 0. Cek dulu, butuh model database baru gak?

Kalau fitur ini butuh table baru, tambahin dulu di `prisma/schema.prisma`:

```prisma
model Iuran {
  id          String   @id @default(uuid())
  wargaId     String
  warga       Warga    @relation(fields: [wargaId], references: [id])
  bulan       Int
  tahun       Int
  jumlah      Int
  status      StatusIuran @default(BELUM_BAYAR)
  createdAt   DateTime @default(now())
}

enum StatusIuran {
  BELUM_BAYAR
  SUDAH_BAYAR
}
```

Lalu jalankan migration:
```bash
npx prisma migrate dev --name add_iuran
```

---

## 1. Bikin folder modul baru

```
src/modules/iuran/
```

---

## 2. `iuran.types.ts` — definisi type

```ts
export interface CreateIuranInput {
  wargaId: string;
  bulan: number;
  tahun: number;
  jumlah: number;
}
```

---

## 3. `iuran.schema.ts` — validasi input (Zod)

```ts
import { z } from "zod";

export const createIuranSchema = z.object({
  wargaId: z.string().uuid(),
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2000),
  jumlah: z.number().positive(),
});
```

---

## 4. `iuran.service.ts` — business logic

```ts
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/app-error";
import { prisma } from "../../config/prisma";
import { CreateIuranInput } from "./iuran.types";

export async function createIuran(input: CreateIuranInput) {
  const warga = await prisma.warga.findUnique({ where: { id: input.wargaId } });

  if (!warga) {
    throw new AppError(StatusCodes.NOT_FOUND, "Warga tidak ditemukan");
  }

  return prisma.iuran.create({ data: input });
}

export async function getAllIuran() {
  return prisma.iuran.findMany({ include: { warga: true } });
}
```

---

## 5. `iuran.controller.ts` — handle HTTP in/out

```ts
import { catchAsync } from "../../utils/catch-async";
import { StatusCodes } from "http-status-codes";
import * as iuranService from "./iuran.service";

export const createIuranController = catchAsync(async (req, res) => {
  const data = await iuranService.createIuran(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data });
});

export const getAllIuranController = catchAsync(async (req, res) => {
  const data = await iuranService.getAllIuran();
  res.status(StatusCodes.OK).json({ success: true, data });
});
```

---

## 6. `iuran.routes.ts` — daftarin endpoint

```ts
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { createIuranSchema } from "./iuran.schema";
import { createIuranController, getAllIuranController } from "./iuran.controller";

const router = Router();

router.post("/",createIuranController);
router.get("/", getAllIuranController);

export default router;
```

---

## 7. Daftarin modul ke `routes/index.ts`

```ts
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import wargaRoutes from "../modules/warga/warga.routes";
import kasRoutes from "../modules/kas/kas.routes";
import iuranRoutes from "../modules/iuran/iuran.routes"; // ⬅ tambahan baru

const router = Router();

router.use("/auth", authRoutes);
router.use("/warga", wargaRoutes);
router.use("/kas", kasRoutes);
router.use("/iuran", iuranRoutes); // ⬅ tambahan baru

export default router;
```

---

## 8. Test endpoint

Pakai Postman / Thunder Client / curl:
```bash
curl -X POST http://localhost:3000/api/iuran \
  -H "Content-Type: application/json" \
  -d '{"wargaId":"uuid-warga","bulan":6,"tahun":2026,"jumlah":50000}'
```

Cek juga skenario gagal: kirim `wargaId` yang gak ada → harus balik `404` dengan pesan "Warga tidak ditemukan", dan kirim body kosong → harus balik `400` dari `validate.middleware.ts`.


---

## Ringkasan urutan (checklist cepat)

- [ ] Cek/tambah model di `schema.prisma` → migrate
- [ ] `{nama}.types.ts`
- [ ] `{nama}.schema.ts`
- [ ] `{nama}.service.ts`
- [ ] `{nama}.controller.ts`
- [ ] `{nama}.routes.ts`
- [ ] Daftarin di `routes/index.ts`
- [ ] Test endpoint (happy path + error path)
- [ ] Commit di feature branch → PR → review → merge
