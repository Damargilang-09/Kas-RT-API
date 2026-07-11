/*
  Warnings:

  - A unique constraint covering the columns `[fee_type_id,user_id,period_month,period_year]` on the table `bills` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "fee_types" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "bills_fee_type_id_user_id_period_month_period_year_key" ON "bills"("fee_type_id", "user_id", "period_month", "period_year");
