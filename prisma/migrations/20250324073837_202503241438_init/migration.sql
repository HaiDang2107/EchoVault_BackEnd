-- CreateTable
CREATE TABLE "Capsule" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "openingTime" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrls" JSONB NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notificationInterval" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Locked',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Capsule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapsuleContributor" (
    "id" UUID NOT NULL,
    "capsuleId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "CapsuleContributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapsuleViewer" (
    "id" UUID NOT NULL,
    "capsuleId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "CapsuleViewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecallQuestion" (
    "id" UUID NOT NULL,
    "capsuleId" UUID NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "RecallQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CapsuleContributor" ADD CONSTRAINT "CapsuleContributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleContributor" ADD CONSTRAINT "CapsuleContributor_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleViewer" ADD CONSTRAINT "CapsuleViewer_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleViewer" ADD CONSTRAINT "CapsuleViewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecallQuestion" ADD CONSTRAINT "RecallQuestion_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
