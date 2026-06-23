import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Nama wajib diisi!" })
    .trim()
    .min(3, { message: "Nama minimal harus 3 karakter!" })
    .max(150, { message: "Nama maksimal 150 karakter!" }),

  email: z
    .string({ error: "Email wajib diisi!" })
    .trim()
    .email({ message: "Format email tidak valid!" })
    .max(150, { message: "Email maksimal 150 karakter" }),

  password: z
    .string({ error: "Password wajib diisi!" })
    .min(8, { message: "Password minimal harus 8 karakter " }),

  houseNumber: z
    .string({ error: "Blok wajib diisi!" })
    .trim()
    .min(1, { message: "Blok rumah wajib diisi" })
    .max(50, { message: "Blok rumah maksimal 50 karakter" }),

  address: z
    .string({ error: "Alamat wajib diisi!" })
    .trim()
    .min(5, { message: "Alamat minimal 5 karakter" })
    .max(255, { message: "Alamat maksimal 255 karakter" }),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email wajib diisi!" })
    .trim()
    .email({ message: "Format email tidak valid" }),

  password: z
    .string({ error: "Password wajib diisi!" })
    .min(1, { message: "Password wajib diisi!" }),
});
