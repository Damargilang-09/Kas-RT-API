import type { Request } from "express";

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

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};
