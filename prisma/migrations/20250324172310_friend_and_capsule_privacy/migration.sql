/*
  Warnings:

  - Added the required column `choicesA` to the `RecallQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `choicesB` to the `RecallQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `choicesC` to the `RecallQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `choicesD` to the `RecallQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswer` to the `RecallQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `explaination` to the `RecallQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Capsule" ADD COLUMN     "privacy" TEXT NOT NULL DEFAULT 'Public';

-- AlterTable
ALTER TABLE "RecallQuestion" ADD COLUMN     "choicesA" TEXT NOT NULL,
ADD COLUMN     "choicesB" TEXT NOT NULL,
ADD COLUMN     "choicesC" TEXT NOT NULL,
ADD COLUMN     "choicesD" TEXT NOT NULL,
ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ADD COLUMN     "explaination" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Friend" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "friendId" UUID NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
