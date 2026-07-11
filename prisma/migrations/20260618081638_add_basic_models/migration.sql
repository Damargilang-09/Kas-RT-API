-- CreateEnum
CREATE TYPE "role" AS ENUM ('Admin', 'User');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'User',
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");
