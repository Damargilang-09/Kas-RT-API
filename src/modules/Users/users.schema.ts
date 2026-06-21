import { z } from "zod";

export const updateUserSchema = z.object({
  name: z
    .string({ error: "Nama harus berupa teks" })
    .trim()
    .min(3, { message: "Nama minimal harus 3 karakter" })
    .max(150, { message: "Nama maksimal 150 karakter" })
    .optional(),

  email: z
    .string({ error: "Email harus berupa teks" })
    .trim()
    .email({ message: "Format email tidak valid" })
    .max(150, { message: "Email maksimal 150 karakter" })
    .optional(),

  role: z.enum(["ADMIN", "BENDAHARA", "WARGA"], {
    error: "Role tidak valid",
  }).optional(),

  status: z.enum(["ACTIVE", "INACTIVE"], {
    error: "Status tidak valid",
  }).optional(),

  houseNumber: z
    .string({ error: "Blok rumah harus berupa teks" })
    .trim()
    .min(1, { message: "Blok rumah wajib diisi" })
    .max(50, { message: "Blok rumah maksimal 50 karakter" })
    .optional(),

  address: z
    .string({ error: "Alamat harus berupa teks" })
    .trim()
    .min(5, { message: "Alamat minimal 5 karakter" })
    .max(255, { message: "Alamat maksimal 255 karakter" })
    .optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"], {
    error: "Status tidak valid",
  }),
});
