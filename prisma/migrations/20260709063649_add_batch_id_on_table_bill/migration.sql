/*
  Warnings:

  - The values [weekly] on the enum `BillingPeriod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BillingPeriod_new" AS ENUM ('monthly', 'once');
ALTER TABLE "public"."fee_types" ALTER COLUMN "billing_period" DROP DEFAULT;
ALTER TABLE "fee_types" ALTER COLUMN "billing_period" TYPE "BillingPeriod_new" USING ("billing_period"::text::"BillingPeriod_new");
ALTER TYPE "BillingPeriod" RENAME TO "BillingPeriod_old";
ALTER TYPE "BillingPeriod_new" RENAME TO "BillingPeriod";
DROP TYPE "public"."BillingPeriod_old";
ALTER TABLE "fee_types" ALTER COLUMN "billing_period" SET DEFAULT 'once';
COMMIT;

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "batch_id" VARCHAR(100);
