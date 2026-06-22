import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UsersService } from "./users.service";
import { AppError } from "../../utils/app-error";

function getIdParam(req: Request): string {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User ID tidak valid");
  }

  return id;
}

export const UsersController = {
  async getAll(req: Request, res: Response) {
    const result = await UsersService.getAllUsers(req.query as Record<string, unknown>);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Daftar user berhasil diambil",
      ...result,
    });
  },

  async getById(req: Request, res: Response) {
    const user = await UsersService.getUserById(getIdParam(req));

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Detail user berhasil diambil",
      data: user,
    });
  },

  async update(req: Request, res: Response) {
    const updatedUser = await UsersService.updateUser(getIdParam(req), req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User berhasil diperbarui",
      data: updatedUser,
    });
  },

  async updateStatus(req: Request, res: Response) {
    const updatedUser = await UsersService.updateUserStatus(
      getIdParam(req),
      req.body
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Status user berhasil diperbarui",
      data: updatedUser,
    });
  },

  async delete(req: Request, res: Response) {
    const deletedUser = await UsersService.deleteUser(getIdParam(req));

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User berhasil dihapus",
      data: deletedUser,
    });
  },
};
