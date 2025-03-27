-- CreateTable
CREATE TABLE "CapsuleMedia" (
    "mediaId" UUID NOT NULL,
    "capsuleId" UUID NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "uploadedBy" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CapsuleMedia_pkey" PRIMARY KEY ("mediaId")
);

-- CreateTable
CREATE TABLE "CapsuleComments" (
    "commentId" UUID NOT NULL,
    "capsuleId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "commentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapsuleComments_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "CapsuleReactions" (
    "reactionId" UUID NOT NULL,
    "capsuleId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "reactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapsuleReactions_pkey" PRIMARY KEY ("reactionId")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "notificationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "capsuleId" UUID,
    "notificationType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CapsuleReactions_capsuleId_userId_key" ON "CapsuleReactions"("capsuleId", "userId");

-- AddForeignKey
ALTER TABLE "CapsuleMedia" ADD CONSTRAINT "CapsuleMedia_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleMedia" ADD CONSTRAINT "CapsuleMedia_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleComments" ADD CONSTRAINT "CapsuleComments_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleComments" ADD CONSTRAINT "CapsuleComments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleReactions" ADD CONSTRAINT "CapsuleReactions_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleReactions" ADD CONSTRAINT "CapsuleReactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
