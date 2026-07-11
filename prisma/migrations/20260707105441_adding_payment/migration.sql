/*
  Warnings:

  - You are about to drop the column `ip_address` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_code` on the `cash_transactions` table. All the data in the column will be lost.
  - You are about to alter the column `rejected_reason` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropIndex
DROP INDEX "cash_transactions_transaction_code_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "ip_address",
DROP COLUMN "user_agent";

-- AlterTable
ALTER TABLE "cash_transactions" DROP COLUMN "transaction_code",
ADD COLUMN     "period_month" INTEGER,
ADD COLUMN     "period_year" INTEGER;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "period_month" INTEGER,
ADD COLUMN     "period_year" INTEGER,
ALTER COLUMN "rejected_reason" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "rejected_reason" VARCHAR(255);

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "deleted_at" TIMESTAMP(3);
