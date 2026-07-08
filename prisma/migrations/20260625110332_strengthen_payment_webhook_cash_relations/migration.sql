/*
  Warnings:

  - You are about to drop the column `source_id` on the `cash_transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idempotency_key]` on the table `payment_attempts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider_event_id]` on the table `payment_webhook_logs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cash_summary_id` to the `cash_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idempotency_key` to the `payment_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "webhook_processed_status" ADD VALUE 'duplicate';

-- AlterTable
ALTER TABLE "cash_transactions" DROP COLUMN "source_id",
ADD COLUMN     "cash_summary_id" UUID NOT NULL,
ADD COLUMN     "expense_id" UUID,
ADD COLUMN     "payment_id" UUID;

-- AlterTable
ALTER TABLE "payment_attempts" ADD COLUMN     "idempotency_key" VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE "payment_webhook_logs" ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "external_transaction_id" VARCHAR(150),
ADD COLUMN     "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provider_event_id" VARCHAR(150);

-- CreateIndex
CREATE INDEX "bills_user_id_idx" ON "bills"("user_id");

-- CreateIndex
CREATE INDEX "bills_fee_type_id_idx" ON "bills"("fee_type_id");

-- CreateIndex
CREATE INDEX "bills_status_idx" ON "bills"("status");

-- CreateIndex
CREATE INDEX "bills_due_date_idx" ON "bills"("due_date");

-- CreateIndex
CREATE INDEX "bills_period_year_period_month_idx" ON "bills"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "cash_summaries_period_year_period_month_idx" ON "cash_summaries"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "cash_transactions_payment_id_idx" ON "cash_transactions"("payment_id");

-- CreateIndex
CREATE INDEX "cash_transactions_expense_id_idx" ON "cash_transactions"("expense_id");

-- CreateIndex
CREATE INDEX "cash_transactions_cash_summary_id_idx" ON "cash_transactions"("cash_summary_id");

-- CreateIndex
CREATE INDEX "cash_transactions_source_type_idx" ON "cash_transactions"("source_type");

-- CreateIndex
CREATE INDEX "cash_transactions_type_idx" ON "cash_transactions"("type");

-- CreateIndex
CREATE INDEX "cash_transactions_transaction_date_idx" ON "cash_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "expenses_requested_by_idx" ON "expenses"("requested_by");

-- CreateIndex
CREATE INDEX "expenses_approved_by_idx" ON "expenses"("approved_by");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_idempotency_key_key" ON "payment_attempts"("idempotency_key");

-- CreateIndex
CREATE INDEX "payment_attempts_bill_id_idx" ON "payment_attempts"("bill_id");

-- CreateIndex
CREATE INDEX "payment_attempts_user_id_idx" ON "payment_attempts"("user_id");

-- CreateIndex
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_logs_provider_event_id_key" ON "payment_webhook_logs"("provider_event_id");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_payment_attempt_id_idx" ON "payment_webhook_logs"("payment_attempt_id");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_external_transaction_id_idx" ON "payment_webhook_logs"("external_transaction_id");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_processed_status_idx" ON "payment_webhook_logs"("processed_status");

-- CreateIndex
CREATE INDEX "payments_bill_id_idx" ON "payments"("bill_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_cash_summary_id_fkey" FOREIGN KEY ("cash_summary_id") REFERENCES "cash_summaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
