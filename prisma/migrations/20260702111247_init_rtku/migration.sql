/*
  Warnings:

  - The `status` column on the `bills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `cash_summary_id` on the `cash_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `cash_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `expense_id` on the `cash_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `cash_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_date` on the `cash_transactions` table. All the data in the column will be lost.
  - The `type` column on the `cash_transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `expenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `effective_start_date` on the `fee_types` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `fee_types` table. All the data in the column will be lost.
  - The `billing_period` column on the `fee_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `reference_type` column on the `mailer_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `mailer_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `payment_attempt_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_code` on the `payments` table. All the data in the column will be lost.
  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_summaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_webhook_logs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[house_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `source_id` to the `cash_transactions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `source_type` on the `cash_transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `mailer_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('superAdmin', 'ketuaRT', 'bendahara', 'warga');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('monthly', 'weekly', 'once');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('unpaid', 'pending', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('approved', 'rejected', 'pending');

-- CreateEnum
CREATE TYPE "MailerLogType" AS ENUM ('bill_created', 'payment_success', 'payment_failed', 'expense_submitted', 'expense_approved', 'expense_rejected', 'reminder', 'system');

-- CreateEnum
CREATE TYPE "MailerReferenceType" AS ENUM ('bill', 'payment', 'expense', 'system');

-- CreateEnum
CREATE TYPE "MailerStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "ExpenseImageType" AS ENUM ('documentation', 'prooving');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'closed', 'failed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expenses');

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "cash_transactions" DROP CONSTRAINT "cash_transactions_cash_summary_id_fkey";

-- DropForeignKey
ALTER TABLE "cash_transactions" DROP CONSTRAINT "cash_transactions_expense_id_fkey";

-- DropForeignKey
ALTER TABLE "cash_transactions" DROP CONSTRAINT "cash_transactions_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_attempts" DROP CONSTRAINT "payment_attempts_bill_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_attempts" DROP CONSTRAINT "payment_attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_webhook_logs" DROP CONSTRAINT "payment_webhook_logs_payment_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_attempt_id_fkey";

-- DropIndex
DROP INDEX "cash_transactions_cash_summary_id_idx";

-- DropIndex
DROP INDEX "cash_transactions_expense_id_idx";

-- DropIndex
DROP INDEX "cash_transactions_payment_id_idx";

-- DropIndex
DROP INDEX "cash_transactions_source_type_idx";

-- DropIndex
DROP INDEX "cash_transactions_transaction_date_idx";

-- DropIndex
DROP INDEX "cash_transactions_type_idx";

-- DropIndex
DROP INDEX "payments_payment_attempt_id_key";

-- DropIndex
DROP INDEX "payments_payment_code_key";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "bills" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "status",
ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE "cash_transactions" DROP COLUMN "cash_summary_id",
DROP COLUMN "description",
DROP COLUMN "expense_id",
DROP COLUMN "payment_id",
DROP COLUMN "transaction_date",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "source_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "source_type",
ADD COLUMN     "source_type" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType";

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "fee_types" DROP COLUMN "effective_start_date",
DROP COLUMN "status",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "billing_period",
ADD COLUMN     "billing_period" "BillingPeriod" NOT NULL DEFAULT 'once';

-- AlterTable
ALTER TABLE "mailer_logs" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "type",
ADD COLUMN     "type" "MailerLogType" NOT NULL,
DROP COLUMN "reference_type",
ADD COLUMN     "reference_type" "MailerReferenceType",
DROP COLUMN "status",
ADD COLUMN     "status" "MailerStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "payment_attempt_id",
DROP COLUMN "payment_code",
ADD COLUMN     "approved_by" UUID,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "payment_proof_img" VARCHAR(255),
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'warga',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'inactive';

-- DropTable
DROP TABLE "attachments";

-- DropTable
DROP TABLE "cash_summaries";

-- DropTable
DROP TABLE "payment_attempts";

-- DropTable
DROP TABLE "payment_webhook_logs";

-- DropEnum
DROP TYPE "attachment_reference_type";

-- DropEnum
DROP TYPE "bill_status";

-- DropEnum
DROP TYPE "billing_period";

-- DropEnum
DROP TYPE "cash_source_type";

-- DropEnum
DROP TYPE "cash_transaction_type";

-- DropEnum
DROP TYPE "expense_status";

-- DropEnum
DROP TYPE "fee_type_status";

-- DropEnum
DROP TYPE "mailer_log_type";

-- DropEnum
DROP TYPE "mailer_reference_type";

-- DropEnum
DROP TYPE "mailer_status";

-- DropEnum
DROP TYPE "payment_attempt_status";

-- DropEnum
DROP TYPE "payment_status";

-- DropEnum
DROP TYPE "user_role";

-- DropEnum
DROP TYPE "user_status";

-- DropEnum
DROP TYPE "webhook_processed_status";

-- CreateTable
CREATE TABLE "expenses_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "approved_by" UUID,
    "expenses_id" UUID,
    "name" VARCHAR(50),
    "description" TEXT,
    "status" "ApprovalStatus",
    "type" "ExpenseImageType",
    "attachment_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expenses_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income" (
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
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

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "income_income_code_key" ON "income"("income_code");

-- CreateIndex
CREATE INDEX "income_status_idx" ON "income"("status");

-- CreateIndex
CREATE INDEX "income_income_date_idx" ON "income"("income_date");

-- CreateIndex
CREATE INDEX "reports_period_year_period_month_idx" ON "reports"("period_year", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "reports_period_month_period_year_key" ON "reports"("period_month", "period_year");

-- CreateIndex
CREATE INDEX "bills_status_idx" ON "bills"("status");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_house_number_key" ON "users"("house_number");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_images" ADD CONSTRAINT "expenses_images_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_images" ADD CONSTRAINT "expenses_images_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_images" ADD CONSTRAINT "expenses_images_expenses_id_fkey" FOREIGN KEY ("expenses_id") REFERENCES "expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
