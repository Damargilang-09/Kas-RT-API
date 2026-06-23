import type { UserRole, UserStatus } from "@prisma/client";

export type GetUsersQuery = {
  search?: string | undefined;
  role?: UserRole | undefined;
  status?: UserStatus | undefined;
  page?: number | undefined;
  limit?: number | undefined;
};

export type UpdateUserRequest = {
  name?: string | undefined;
  email?: string | undefined;
  role?: UserRole | undefined;
  status?: UserStatus | undefined;
  houseNumber?: string | undefined;
  address?: string | undefined;
};

export type UpdateUserStatusRequest = {
  status: UserStatus;
};
