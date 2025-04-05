/*
  Warnings:

  - A unique constraint covering the columns `[capsuleId,userId]` on the table `CapsuleContributor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[capsuleId,userId]` on the table `CapsuleViewer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "UserLogs" (
    "log_id" SERIAL NOT NULL,
    "user_id" UUID,
    "capsule_id" UUID,
    "log_action" VARCHAR(50) NOT NULL,
    "log_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLogs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CapsuleContributor_capsuleId_userId_key" ON "CapsuleContributor"("capsuleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CapsuleViewer_capsuleId_userId_key" ON "CapsuleViewer"("capsuleId", "userId");

-- AddForeignKey
ALTER TABLE "UserLogs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
