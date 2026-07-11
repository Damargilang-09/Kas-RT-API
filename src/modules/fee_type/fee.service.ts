import { prisma } from "../../configs/prisma-client.config";

import { FeeTypeSelect } from "./fee.select";
import type {
  CreateFeeTypeInput,
  DeleteFeeTypeInput,
  FeeTypeDetailInput,
  UpdateFeeTypeInput,
} from "./fee.validation";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";

export type FeeTypePayload = {
  id: string;
  role: string;
};

export class FeeService {
  static async getFeeTypes() {
    const feeTypes = await prisma.feeType.findMany({
      where: { deleted_at: null },
      select: FeeTypeSelect,
      orderBy: { name: "asc" },
    });

    return feeTypes;
  }

  static async createFeeType(
    { body }: CreateFeeTypeInput,
    payload: FeeTypePayload,
  ) {
    const existingFeeType = await prisma.feeType.findFirst({
      where: { name: body.name, deleted_at: null },
    });

    if (existingFeeType) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Nama jenis tagihan sudah ada",
      );
    }

    const feeType = await prisma.feeType.create({
      data: {
        createdById: payload.id,
        name: body.name,
        amount: body.amount,
        description: body.description ?? null,
        billingPeriod: body.billingPeriod,
        dueDay: body.dueDay ?? null,
      },
      select: FeeTypeSelect,
    });

    return feeType;
  }

  static async getFeeTypeDetail({ params }: FeeTypeDetailInput) {
    const feeTypeDetail = await prisma.feeType.findFirst({
      where: { id: params.id, deleted_at: null },
      select: FeeTypeSelect,
    });

    if (!feeTypeDetail) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis tagihan tidak ditemukan",
      );
    }

    return feeTypeDetail;
  }

  static async updateFeeType({
    params,
    body,
    payload,
  }: UpdateFeeTypeInput & { payload: FeeTypePayload }) {
    const existingFeeType = await prisma.feeType.findFirst({
      where: { id: params.id, deleted_at: null },
    });

    if (!existingFeeType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis Tagihan Tidak Ditemukan",
      );
    }

    if (body.name && body.name !== existingFeeType.name) {
      const duplicateFeeType = await prisma.feeType.findFirst({
        where: { name: body.name, deleted_at: null, NOT: { id: params.id } },
      });

      if (duplicateFeeType) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Nama jenis sudah digunakan",
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // versioningnya di sini, jadi ini nambahin deletedAt
      await tx.feeType.update({
        where: { id: params.id },
        data: { deleted_at: new Date() },
      });

      // terus tinggal buat iuran baru.
      const newFeeType = await tx.feeType.create({
        data: {
          createdById: payload.id,
          name: body.name ?? existingFeeType.name,
          amount: body.amount ?? existingFeeType.amount,
          description:
            body.description !== undefined
              ? body.description
              : existingFeeType.description,
          billingPeriod: body.billingPeriod ?? existingFeeType.billingPeriod,
          dueDay:
            body.dueDay !== undefined ? body.dueDay : existingFeeType.dueDay,
        },
        select: FeeTypeSelect,
      });

      return newFeeType;
    });

    return result;
  }

  static async deleteFeeType({ params }: DeleteFeeTypeInput) {
    const existingFeeType = await prisma.feeType.findFirst({
      where: { id: params.id, deleted_at: null },
    });

    if (!existingFeeType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis Tagihan Tidak Ditemukan",
      );
    }

    const deletedFeeType = await prisma.feeType.update({
      where: { id: params.id },
      data: { deleted_at: new Date() },
      select: FeeTypeSelect,
    });

    return deletedFeeType;
  }
}
