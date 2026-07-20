import cron from "node-cron";
import { BillStatus } from "../../../generated/prisma";
import { prisma } from "../../configs/prisma-client.config";
import { getJakartaStartOfToday } from "./bill.helper";

const BILL_OVERDUE_CRON_SCHEDULE = "5 0 * * *";
const JAKARTA_TIMEZONE = "Asia/Jakarta";

let isUpdatingOverdueBills = false;

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

async function runBillOverdueJob(trigger: "startup" | "scheduled") {
  if (isUpdatingOverdueBills) {
    console.log("[CRON] Pengecekan overdue masih berjalan, proses dilewati");
    return;
  }

  isUpdatingOverdueBills = true;

  try {
    const updatedCount = await updateOverdueBills();

    console.log(
      `[CRON] ${updatedCount} tagihan diubah menjadi overdue (${trigger})`,
    );
  } catch (error) {
    console.error("[CRON] Gagal memperbarui status tagihan overdue", error);
  } finally {
    isUpdatingOverdueBills = false;
  }
}

export function startBillOverdueCron() {
  // Dijalankan sekali ketika aplikasi menyala untuk mengejar jadwal yang terlewat.
  void runBillOverdueJob("startup");

  // Dijalankan setiap hari pukul 00.05 WIB menggunakan node-cron.
  const billOverdueTask = cron.schedule(
    BILL_OVERDUE_CRON_SCHEDULE,
    async () => {
      await runBillOverdueJob("scheduled");
    },
    {
      name: "bill-overdue-daily",
      timezone: JAKARTA_TIMEZONE,
      noOverlap: true,
    },
  );

  console.log("[CRON] Bill overdue aktif setiap hari pukul 00.05 WIB");

  return billOverdueTask;
}
