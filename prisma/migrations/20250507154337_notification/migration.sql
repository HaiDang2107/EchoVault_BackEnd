/*
  Warnings:

  - Added the required column `notiTime` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "isSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notiTime" TIMESTAMP(3) NOT NULL;
