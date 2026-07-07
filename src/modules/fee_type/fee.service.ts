import { prisma } from "../../configs/prisma-client.config";
import { feeTypeSelect } from "./fee.select";
import type {
  CreateFeeTypeInput,
  DeleteFeeTypeInput,
  FeeTypeDetailInput,
  UpdateFeeTypeInput,
} from "./fee.validation";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";

console.log("[FEE_SERVICE] file loaded");

export type feeTypePayload = {
  id: string;
  role: string;
};
export class FeeService {
  static async getFeeTypes() {

    const feeTypes = await prisma.feeType.findMany({
      where: { deletedAt: null },
      select: feeTypeSelect,
      orderBy: { name: "asc" },
    });

    console.log(
      "[FEE_SERVICE][GET_LIST] setelah findMany, jumlah data:",
      feeTypes.length,
    );

    return feeTypes;
  }

  static async createFeeType(
    { body }: CreateFeeTypeInput,
    payload: feeTypePayload,
  ) {

    const existingFeeType = await prisma.feeType.findFirst({
      where: {
        name: body.name,
        deletedAt: null,
      },
    });



    if (existingFeeType) {
      console.log(
        "[FEE_SERVICE][CREATE] duplicate ditemukan, akan throw error",
      );
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        "Nama jenis tagihan sudah ada",
      );
    }



    const feeType = await prisma.feeType.create({
      data: {
        createdBy: payload.id,
        name: body.name,
        amount: body.amount,
        description: body.description ?? null,
        billingPeriod: body.billingPeriod,
        dueDay: body.dueDay ?? null,
      },
      select: feeTypeSelect,
    });



    return feeType;
  }

  static async getFeeTypeDetail({ params }: FeeTypeDetailInput) {

    const feeTypeDetail = await prisma.feeType.findFirst({
      where: { id: params.id, deletedAt: null },
      select: feeTypeSelect,
    });



    if (!this.getFeeTypeDetail) {
     
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
  }: UpdateFeeTypeInput & { payload: feeTypePayload }) {
 
    const existingFeeType = await prisma.feeType.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    console.log("[FEE_SERVICE][DELETE] existingFeeType:", existingFeeType);

    console.log("[FEE_SERVICE][UPDATE] existingFeeType:", existingFeeType);

    if (!existingFeeType) {

      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis Tagihan Tidak Ditemukan",
      );
    }

    if (body.name && body.name !== existingFeeType.name) {
      console.log(
        "[FEE_SERVICE][UPDATE] cek duplicate untuk name baru:",
        body.name,
      );
      const duplicateFeeType = await prisma.feeType.findFirst({
        where: { name: body.name, deletedAt: null, NOT: { id: params.id } },
      });
  
      if (duplicateFeeType) {
        console.log("[FEE_SERVICE][UPDATE] duplicate ditemukan, throw error");
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Nama jenis sudah digunakan",
        );
      }
    }
    console.log("[FEE_SERVICE][UPDATE] sebelum transaction");
    const result = await prisma.$transaction(async (tx) => {
      console.log("[FEE_SERVICE][UPDATE][TX] mulai transaction");
      console.log("[FEE_SERVICE][UPDATE][TX] sebelum archive feeType lama");
      await tx.feeType.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });
     
      const newFeeType = await tx.feeType.create({
        data: {
          createdBy: payload.id,
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
        select: feeTypeSelect,
      });
      console.log(
        "[FEE_SERVICE][UPDATE][TX] setelah create feeType baru:",
        newFeeType,
      );
      return newFeeType;
    });
    console.log("[FEE_SERVICE][UPDATE] setelah transaction result:", result);
    return result;
  }
  static async deleteFeeType({ params }: DeleteFeeTypeInput) {
    console.log("[FEE_SERVICE][DELETE] masuk service");
    console.log("[FEE_SERVICE][DELETE] params:", params);
    console.log("[FEE_SERVICE][DELETE] sebelum cari existingFeeType");
    const existingFeeType = await prisma.feeType.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    console.log("[FEE_SERVICE][DELETE] existingFeeType:", existingFeeType);

    console.log("[FEE_SERVICE][UPDATE] existingFeeType:", existingFeeType);

    if (!existingFeeType) {
      console.log(
        "[FEE_SERVICE][DELETE] existing tidak ditemukan, throw error",
      );
      console.log(
        "[FEE_SERVICE][UPDATE] existing tidak ditemukan, throw error",
      );
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Jenis Tagihan Tidak Ditemukan",
      );
    }

    console.log("[FEE_SERVICE][DELETE] sebelum soft delete update");
    const deletedFeeType = await prisma.feeType.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
      select: feeTypeSelect,
    });

    console.log("[FEE_SERVICE][DELETE] setelah soft delete:", deletedFeeType);
    return deletedFeeType;
  }
}
