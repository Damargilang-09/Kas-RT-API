import { BillStatus } from "../../../generated/prisma";
import { prisma } from "../../configs/prisma-client.config";
import {
  getJakartaDateParts,
  getJakartaStartOfToday,
} from "./bill.helper";

let lastRunDate: string | null = null;

export async function updateOverdueBills() {
  const today = getJakartaStartOfToday();

  const result = await prisma.bill.updateMany({
    where: {
      deleted_at: null,
      status: BillStatus.unpaid,
      dueDate: {
        lt: today,
      },
    },
    data: {
      status: BillStatus.overdue,
    },
  });

  return result.count;
}

async function runOverdueCron() {
  const jakartaNow = getJakartaDateParts();
  const currentDate = `${jakartaNow.year}-${jakartaNow.month}-${jakartaNow.day}`;

  const isScheduledTime = jakartaNow.hour === 0 && jakartaNow.minute === 5;
  const alreadyRunToday = lastRunDate === currentDate;

  if (!isScheduledTime || alreadyRunToday) {
    return;
  }

  lastRunDate = currentDate;

  try {
    const updatedCount = await updateOverdueBills();
    console.log(
      `[CRON] ${updatedCount} tagihan diubah menjadi overdue pada ${currentDate}`,
    );
  } catch (error) {
    console.error("[CRON] Gagal memperbarui status tagihan overdue", error);
  }
}

export function startBillOverdueCron() {
  // jalan sekali saat aplikasi aktif, biar tagihan yang terlewat tetap diperbarui.
  void updateOverdueBills().catch((error) => {
    console.error("[CRON] Gagal menjalankan pengecekan overdue awal", error);
  });

  // Mengecek waktu setiap menit dan menjalankan proses pada 00.05 WIB.
  return setInterval(() => {
    void runOverdueCron();
  }, 60_000);
}
