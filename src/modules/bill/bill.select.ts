export const billSelect = {
  id: true,
  feeTypeId: true,
  userId: true,
  billCode: true,
  batchId: true,
  amount: true,
  periodYear: true,
  periodMonth: true,
  dueDate: true,
  status: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  feeType: { select: { id: true, name: true, billingPeriod: true } },
  user: { select: { id: true, name: true, email: true, houseNumber: true } },
};

export const myBillDetailSelect = {
  ...billSelect,
  payments: {
    where: {
      deleted_at: null,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      paidAt: true,
      status: true,
      rejectedReason: true,
      payment_proof_img: true,
      createdAt: true,
    },
  },
};
