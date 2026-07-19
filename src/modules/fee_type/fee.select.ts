export const FeeTypeSelect = {
  id: true,
  name: true,
  description: true,
  amount: true,
  billingPeriod: true,
  dueDay: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, email: true, name: true } },
};
