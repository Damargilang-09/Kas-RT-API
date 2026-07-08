/*
  Warnings:

  - You are about to drop the column `type` on the `expenses_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses_images" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ExpenseImageType";
