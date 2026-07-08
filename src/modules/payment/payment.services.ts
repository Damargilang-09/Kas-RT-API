import { prisma } from "../../configs/prisma-client.config";
import {
  PaymentApprovalInput,
  PaymentCreateInput,
  PaymentDetailInput,
} from "./payment.validations";
import { ResponseError } from "../../utils/response-error.utils";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../generated/prisma";
import { CloudinaryUtil } from "../../utils/cloudinary.utils";
import { AllListQueryInput } from "../../validation/queryValidation";

export class PaymentServices {
  static async create(
    { params, body }: PaymentCreateInput,
    file: Express.Multer.File,
  ) {
    //todo ubah menjadi findfirst dan tambahkan deletedAt
    const findBill = await prisma.bill.findFirst({
      where: { id: params.billId, deleted_at: null },
      include: { feeType: { select: { name: true } } },
    });

    if (!findBill)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Tagihan tidak ditemukan!",
      );

    if (body.userId !== findBill.userId)
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "anda tidak dapat melakukan pembayaran ini",
      );

    switch (findBill.status) {
      case "pending":
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Pembayaran untuk tagihan ini sedang diproses, mohon tunggu verifikasi admin",
        );
      case "paid":
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Tagihan ini sudah dibayarkan",
        );
      case "overdue":
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Tagihan ini sudah melewati batas waktu pembayaran. Silakan hubungi pengurus RT untuk informasi lebih lanjut",
        );
      case "cancelled":
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          "Tagihan ini sudah dibatalkan dan tidak dapat diproses pembayarannya",
        );
    }
    let uploadedImage: string;
    try {
      uploadedImage = await CloudinaryUtil.uploadStream(
        file.buffer,
        "payments",
      );
    } catch (error) {
      throw new ResponseError(
        StatusCodes.BAD_GATEWAY,
        "Gagal mengunggah bukti pembayaran, silakan coba lagi",
      );
    }

    try {
      const { payment, bill } = await prisma.$transaction(async (tx) => {
        const createdPayment = await tx.payment.create({
          data: {
            billId: findBill.id,
            userId: body.userId,
            amount: findBill.amount,
            payment_proof_img: uploadedImage,
            paymentMethod: body.paymentMethod ?? null,
            paidAt: new Date(),
          },
        });

        const updatedBill = await tx.bill.update({
          where: { id: findBill.id },
          data: {
            status: "pending",
            paidAt: new Date(),
          },
        });

        return { payment: createdPayment, bill: updatedBill };
      });

      return {
        id: payment.id,
        feeTypeName: findBill.feeType.name,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt,
        status: payment.status,
        billStatus: bill.status,
        paymentProofImg: payment.payment_proof_img,
      };
    } catch (error) {
      const publicId = CloudinaryUtil.extractPublicId(uploadedImage);
      await CloudinaryUtil.delete([publicId]).catch(() => {});
      throw error;
    }
  }

  static async getAll({ query }: AllListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.PaymentWhereInput = { deleted_at: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.bill = {
        feeType: {
          name: { contains: query.search, mode: "insensitive" },
        },
      };
    }

    if (query.year) {
      where.createdAt = {
        gte: new Date(`${query.year}-01-01`),
        lt: new Date(`${query.year + 1}-01-01`),
      };
    }

    const [payment, totalPayment] = await Promise.all([
      await prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          bill: { select: { feeType: { select: { name: true } } } },
        },
      }),
      await prisma.payment.count({ where }),
    ]);

    const formattedPayments = payment.map((payment) => ({
      id: payment.id,
      billId: payment.billId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
      status: payment.status,
      userName: payment.user.name,
      feeTypeName: payment.bill.feeType.name,
    }));

    return {
      formattedPayments,
      meta: {
        page: query.page,
        limit: take,
        totalData: totalPayment,
        totalPage: Math.ceil(totalPayment / take),
      },
    };
  }

  static async getById({ params }: PaymentDetailInput) {
    const findPayment = await prisma.payment.findFirst({
      where: {
        AND: [
          {
            id: params.id,
          },
          {
            deleted_at: null,
          },
        ],
      },
      include: {
        users_payments_approved_byTousers: {
          select: { name: true },
        },
        user: { select: { name: true } },
        bill: { select: { feeType: { select: { name: true } } } },
      },
    });

    if (!findPayment)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Detail tagihan tidak dapat di temukan !",
      );

    return {
      id: findPayment.id,
      billId: findPayment.billId,
      amount: findPayment.amount,
      paymentMethod: findPayment.paymentMethod,
      paidAt: findPayment.paidAt,
      paymentProff: findPayment.payment_proof_img,
      approvedBy: findPayment.users_payments_approved_byTousers?.name,
      userName: findPayment.user.name,
      feeTypeName: findPayment.bill.feeType.name,
    };
  }

  static async approve({ params, body }: PaymentApprovalInput) {
    const findPayment = await prisma.payment.findUnique({
      where: { id: params.id, deleted_at: null },
    });

    if (!findPayment)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Tagihan tidak di temukan !",
      );

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: params.id, deleted_at: null },
        data: {
          status: body.status,
          approved_by: body.userId,
          rejectedReason:
            body.status === "rejected" ? (body.rejectedReason ?? null) : null,
        },
      });

      await tx.bill.update({
        where: { id: findPayment.billId },
        data: {
          status: body.status === "rejected" ? "unpaid" : "paid", 
          paidAt: body.status === "approved" ? new Date() : null,
        },
      });

      return updatedPayment;
    });
    return result;
  }

  static async delete({ params }: PaymentDetailInput) {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id, deleted_at: null },
    });

    if (!payment)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Pembayaran tidak ditemukan",
      );

    if (payment.payment_proof_img) {
      const publicId = CloudinaryUtil.extractPublicId(
        payment.payment_proof_img,
      );
      await CloudinaryUtil.delete([publicId]).catch(() => {});
    }

    await prisma.payment.update({
      where: { id: params.id },
      data: { deleted_at: new Date() },
    });
  }
}
