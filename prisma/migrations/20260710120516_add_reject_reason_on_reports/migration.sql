-- AlterTable
ALTER TABLE "Reports" ADD COLUMN     "rejected_reason" TEXT;

-- CreateIndex
CREATE INDEX "Reports_status_idx" ON "Reports"("status");
