/*
  Warnings:

  - You are about to drop the `CapsuleContributor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CapsuleContributor" DROP CONSTRAINT "CapsuleContributor_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "CapsuleContributor" DROP CONSTRAINT "CapsuleContributor_userId_fkey";

-- DropTable
DROP TABLE "CapsuleContributor";
