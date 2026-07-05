import { prisma } from "../../configs/prisma-client.config";
import {
  PaymentApprovalInput,
  PaymentCreateInput,
  PaymentDetailInput,
  PaymentListQueryInput,
} from "./payment.validations";
import { ResponseError } from "../../utils/response-error.utils";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../generated/prisma";
import { CloudinaryUtil } from "../../utils/cloudinary.utils";

export class PaymentServices {
  static async create(
    { params, body }: PaymentCreateInput,
    file: Express.Multer.File,
  ) {
    //todo ubah menjadi findfirst dan tambahkan deletedAt
    const findBill = await prisma.bill.findFirst({
      where: {AND:[{ id: params.billId },{deleted_at:null}]} ,
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
    const uploadedFile = await CloudinaryUtil.uploadStream(file.buffer);

    const { payment } = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          billId: findBill.id,
          userId: body.userId,
          amount: findBill.amount,
          payment_proof_img: uploadedFile,
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
      paymentProofImg: payment.payment_proof_img,
    };
  }

  static async getAll({ query }: PaymentListQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const where: Prisma.PaymentWhereInput = { deleted_at: null };

    if (query.status) {
      where.status = query.status;
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

  static async update({ params, body }: PaymentApprovalInput) {
    const findPayment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!findPayment)
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        "Tagihan tidak di temukan !",
      );

    await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: params.id },
        data: {
          status: body.status,
          approved_by: body.userId,
        },
      });
      await tx.bill.update({
        where: { id: findPayment.billId },
        data: {
          status: body.billStatus,
        },
      });

      return updatedPayment;
    });
  }

  static async delete({ params }: PaymentDetailInput) {
    const findPayment = await prisma.payment.findMany({
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
    });

    if (!findPayment)
      throw new ResponseError(StatusCodes.NOT_FOUND, "Payment tidak ditemukan");

    await prisma.payment.update({
      where: { id: params.id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
