/*
  Warnings:

  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'bendahara', 'warga');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "billing_period" AS ENUM ('monthly', 'weekly', 'once');

-- CreateEnum
CREATE TYPE "fee_type_status" AS ENUM ('draft', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "bill_status" AS ENUM ('unpaid', 'pending', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_attempt_status" AS ENUM ('pending', 'success', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('success', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "webhook_processed_status" AS ENUM ('success', 'failed', 'ignored');

-- CreateEnum
CREATE TYPE "expense_status" AS ENUM ('submitted', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "cash_source_type" AS ENUM ('payment', 'expense');

-- CreateEnum
CREATE TYPE "cash_transaction_type" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "mailer_log_type" AS ENUM ('bill_created', 'payment_success', 'payment_failed', 'expense_submitted', 'expense_approved', 'expense_rejected', 'reminder', 'system');

-- CreateEnum
CREATE TYPE "mailer_reference_type" AS ENUM ('bill', 'payment', 'expense', 'system');

-- CreateEnum
CREATE TYPE "mailer_status" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "attachment_reference_type" AS ENUM ('expense', 'payment', 'bill');

-- DropTable
DROP TABLE "Users";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'warga',
    "house_number" VARCHAR(50),
    "address" TEXT,
    "status" "user_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_types" (
    "id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "billing_period" "billing_period" NOT NULL DEFAULT 'once',
    "due_day" INTEGER,
    "effective_start_date" DATE,
    "status" "fee_type_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" UUID NOT NULL,
    "fee_type_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bill_code" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "period_month" INTEGER,
    "period_year" INTEGER,
    "due_date" DATE NOT NULL,
    "status" "bill_status" NOT NULL DEFAULT 'unpaid',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "payment_gateway" VARCHAR(100) NOT NULL,
    "payment_method" VARCHAR(100),
    "external_reference" VARCHAR(150),
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payment_url" TEXT,
    "status" "payment_attempt_status" NOT NULL DEFAULT 'pending',
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "payment_attempt_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "payment_code" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payment_method" VARCHAR(100),
    "paid_at" TIMESTAMP(3) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'success',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_logs" (
    "id" UUID NOT NULL,
    "payment_attempt_id" UUID,
    "gateway_name" VARCHAR(100) NOT NULL,
    "external_reference" VARCHAR(150),
    "event_type" VARCHAR(100),
    "payload" JSONB NOT NULL,
    "status_received" VARCHAR(100),
    "processed_status" "webhook_processed_status" NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "expense_code" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "expense_date" DATE NOT NULL,
    "status" "expense_status" NOT NULL DEFAULT 'submitted',
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_transactions" (
    "id" UUID NOT NULL,
    "transaction_code" VARCHAR(100) NOT NULL,
    "source_type" "cash_source_type" NOT NULL,
    "source_id" UUID NOT NULL,
    "type" "cash_transaction_type" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "transaction_date" DATE NOT NULL,
    "created_by_system" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_summaries" (
    "id" UUID NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_expense" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailer_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "email_to" VARCHAR(150) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "type" "mailer_log_type" NOT NULL,
    "reference_type" "mailer_reference_type",
    "reference_id" UUID,
    "status" "mailer_status" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailer_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" UUID,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "reference_type" "attachment_reference_type" NOT NULL,
    "reference_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" VARCHAR(100),
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bills_bill_code_key" ON "bills"("bill_code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_external_reference_key" ON "payment_attempts"("external_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_attempt_id_key" ON "payments"("payment_attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_code_key" ON "payments"("payment_code");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expense_code_key" ON "expenses"("expense_code");

-- CreateIndex
CREATE UNIQUE INDEX "cash_transactions_transaction_code_key" ON "cash_transactions"("transaction_code");

-- CreateIndex
CREATE UNIQUE INDEX "cash_summaries_period_month_period_year_key" ON "cash_summaries"("period_month", "period_year");

-- AddForeignKey
ALTER TABLE "fee_types" ADD CONSTRAINT "fee_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_fee_type_id_fkey" FOREIGN KEY ("fee_type_id") REFERENCES "fee_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_attempt_id_fkey" FOREIGN KEY ("payment_attempt_id") REFERENCES "payment_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_logs" ADD CONSTRAINT "payment_webhook_logs_payment_attempt_id_fkey" FOREIGN KEY ("payment_attempt_id") REFERENCES "payment_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailer_logs" ADD CONSTRAINT "mailer_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
