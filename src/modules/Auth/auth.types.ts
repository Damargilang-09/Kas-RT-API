export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  houseNumber: string;
  address: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type JwtPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "BENDAHARA" | "WARGA";
};

export type CreateUserData = Omit<RegisterRequest, "password"> & {
  passwordHash: string;
};