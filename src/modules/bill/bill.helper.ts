export function makeBillCode(params: {
  periodYear?: number | null;
  periodMonth?: number | null;
  feeTypeId: string;
  billNumber: number;
}) {
  const period =
    params.periodYear && params.periodMonth
      ? `${params.periodYear}${String(params.periodMonth).padStart(2, "0")}`
      : "ONCE";

  const fee = params.feeTypeId.slice(0, 4).toUpperCase();
  const billNumberText = String(params.billNumber).padStart(4, "0");
  const randomNumber = Math.random().toString(16).slice(2, 6).toUpperCase();

  const billCode = `BILL-${period}-${fee}-${billNumberText}-${randomNumber}`;

  return billCode;
}

export function makeBillBatchId(params: {
  periodYear?: number | null;
  periodMonth?: number | null;
  feeTypeId: string;
}) {
  const period =
    params.periodYear && params.periodMonth
      ? `${params.periodYear}${String(params.periodMonth).padStart(2, "0")}`
      : "ONCE";

  const fee = params.feeTypeId.slice(0, 4).toUpperCase();
  const randomNumber = Math.random().toString(16).slice(2, 8).toUpperCase();

  const batchId = `BATCH-${period}-${fee}-${randomNumber}`;

  return batchId;
}

export function calculateMonthlyDueDate(params: {
  periodYear: number;
  periodMonth: number;
  dueDay: number;
}) {
  const lastDayOfMonth = new Date(
    Date.UTC(params.periodYear, params.periodMonth, 0),
  ).getUTCDate();

  const finalDueDay = Math.min(params.dueDay, lastDayOfMonth);

  return new Date(
    Date.UTC(params.periodYear, params.periodMonth - 1, finalDueDay),
  );
}

export function getJakartaDateParts(date = new Date()) {
  const jakartaOffsetInMilliseconds = 7 * 60 * 60 * 1000;
  const jakartaDate = new Date(date.getTime() + jakartaOffsetInMilliseconds);

  return {
    year: jakartaDate.getUTCFullYear(),
    month: jakartaDate.getUTCMonth() + 1,
    day: jakartaDate.getUTCDate(),
    hour: jakartaDate.getUTCHours(),
    minute: jakartaDate.getUTCMinutes(),
  };
}

export function getJakartaStartOfToday(date = new Date()) {
  const jakartaDate = getJakartaDateParts(date);

  return new Date(
    Date.UTC(jakartaDate.year, jakartaDate.month - 1, jakartaDate.day),
  );
}

export function isDueDatePassed(dueDate: Date, date = new Date()) {
  return dueDate < getJakartaStartOfToday(date);
}
