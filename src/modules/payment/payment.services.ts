import { prisma } from "../../configs/prisma-client.config";
import {
  PaymentApprovalInput,
  PaymentCreateInput,
  PaymentDetailInput,
} from "./payment.validations";
import { ResponseError } from "../../utils/response-error.util";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../generated/prisma";
import { CloudinaryUtil } from "../../utils/cloudinary.utils";
import {
  AllListQueryInput,
  userPayload,
} from "../../validation/queryValidation";
import { error } from "node:console";

export class PaymentServices {
  static async create(
    { params, body }: PaymentCreateInput,
    file: Express.Multer.File,
    payload: userPayload,
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

    if (findBill.userId !== payload.id)
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
            userId: payload.id,
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

    if (query.year && query.month) {
      where.paidAt = {
        gte: new Date(query.year, query.month - 1, 1),
        lt: new Date(query.year, query.month, 1),
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
  static async grtByUserId(payload: userPayload, { query }: AllListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.PaymentWhereInput = {
      userId: payload.id,
      deleted_at: null,
    };

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

  static async approve(
    { params, body }: PaymentApprovalInput,
    payload: userPayload,
  ) {
    const findPayment = await prisma.payment.findUnique({
      where: { id: params.id, deleted_at: null },
    });

    if (!findPayment)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Tagihan tidak di temukan !",
      );

    if (findPayment.status !== "pending")
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Pembayaran ini sudah diproses sebelumnya dan tidak dapat diubah kembali!",
      );

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: params.id, deleted_at: null },
        data: {
          status: body.status,
          approved_by: body.status === "approved" ? (payload.id ?? null) : null,
          rejectedReason:
            body.status === "rejected" ? (body.rejectedReason ?? null) : null,
        },
      });

      await tx.bill.update({
        where: { id: findPayment.billId },
        data: {
          status: body.status === "rejected" ? "unpaid" : "paid",
        },
      });

      if (body.status === "approved")
        await tx.cashTransaction.create({
          data: {
            amount: findPayment.amount,
            sourceId: findPayment.id,
            sourceType: "payment",
            type: "income",
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
          },
        });
      // const{userId,...formattedPayment} = updatedPayment
      return updatedPayment;
    });
    const { userId, approved_by, ...formattedPayment } = result;
    return formattedPayment;
  }

  static async delete({ params }: PaymentDetailInput, payload: userPayload) {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id, deleted_at: null },
    });
    if (!payment)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Pembayaran tidak ditemukan",
      );

    if (payment?.userId !== payload.id)
      throw new ResponseError(
        StatusCodes.CONFLICT,
        "Anda tidak dapat menghapus riwayat ini",
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
