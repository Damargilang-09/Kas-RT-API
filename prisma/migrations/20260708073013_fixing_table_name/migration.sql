/*
  Warnings:

  - You are about to drop the `expenses_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `income` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "expenses_images" DROP CONSTRAINT "expenses_images_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "expenses_images" DROP CONSTRAINT "expenses_images_created_by_fkey";

-- DropForeignKey
ALTER TABLE "expenses_images" DROP CONSTRAINT "expenses_images_expenses_id_fkey";

-- DropForeignKey
ALTER TABLE "income" DROP CONSTRAINT "income_created_by_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_created_by_fkey";

-- DropTable
DROP TABLE "expenses_images";

-- DropTable
DROP TABLE "income";

-- DropTable
DROP TABLE "reports";

-- CreateTable
CREATE TABLE "Expenses_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "approved_by" UUID,
    "expenses_id" UUID,
    "status" "ApprovalStatus",
    "attachment_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Expenses_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "income_code" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "income_date" DATE NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "period_month" INTEGER,
    "period_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "approved_by" UUID,
    "report_proof_img" VARCHAR(255),
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_expense" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Income_income_code_key" ON "Income"("income_code");

-- CreateIndex
CREATE INDEX "Income_income_date_idx" ON "Income"("income_date");

-- CreateIndex
CREATE INDEX "Income_status_idx" ON "Income"("status");

-- CreateIndex
CREATE INDEX "Reports_period_year_period_month_idx" ON "Reports"("period_year", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "Reports_period_month_period_year_key" ON "Reports"("period_month", "period_year");

-- AddForeignKey
ALTER TABLE "Expenses_images" ADD CONSTRAINT "Expenses_images_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses_images" ADD CONSTRAINT "Expenses_images_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses_images" ADD CONSTRAINT "Expenses_images_expenses_id_fkey" FOREIGN KEY ("expenses_id") REFERENCES "expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
