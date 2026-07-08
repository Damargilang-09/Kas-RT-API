/*
  Warnings:

  - You are about to drop the column `description` on the `expenses_images` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `expenses_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses_images" DROP COLUMN "description",
DROP COLUMN "name";
