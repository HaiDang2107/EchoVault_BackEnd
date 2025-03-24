/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerUserId]` on the table `OAuthProvider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OAuthProvider_provider_providerUserId_key" ON "OAuthProvider"("provider", "providerUserId");
