import * as zod from "zod";

export class AuthValidation {
  static readonly REGISTER_USER = zod.object({
    body: zod.object({
      name: zod
        .string()
        .min(5, "Nama harus 5-150 karakter")
        .max(150, "Nama harus 10-150 karakter"),

      email: zod
        .string()
        .min(1, "Email wajib diisi")
        .email("Format email tidak valid!")
        .transform((email) => email.trim().toLowerCase()),

      password: zod.string().min(8, "Password minimal 8 karakter"),

      houseNumber: zod.string().min(1, "Blok rumah wajib diisi!"),

      address: zod.string().min(1, "Alamat wajib diisi"),
    }),
  });

  static readonly LOGIN_USER = zod.object({
    body: zod.object({
      email: zod
        .string()
        .min(1, "Email wajib diisi")
        .email("Format email tidak valid!")
        .transform((email) => email.trim().toLowerCase()),

      password: zod.string().min(8, "Password minimal 8 karakter"),
    }),
  });
}

export type AuthRegisterRequest = zod.infer<
  typeof AuthValidation.REGISTER_USER
>;

export type AuthLoginRequest = zod.infer<typeof AuthValidation.LOGIN_USER>;

// kenapa gaada input role dan status, karna memang register user gabisa pilih. hardcode aja nanti
