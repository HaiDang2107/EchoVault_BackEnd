import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Tìm người dùng theo username
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      // find in User table
      where: { email }, // attribute email
    });
  }

  async createUser(email: string, password: string) {
    return this.prisma.user.create({
      data: {
        email: email,
        passwordHash: password,
      },
    });
  }

  async findUserByProviderUserId(
    tx: any,
    provider: string,
    providerUserId: string,
  ) {
    return this.prisma.oAuthProvider.findUnique({
      where: {
        provider_providerUserId: {
          provider: provider,
          providerUserId: providerUserId,
        },
      },
      include: { user: true },
    });
  }

  async updateUserProfileAndTokens(
    tx: any,
    existingUser: any,
    profile: any,
    accessToken: string,
    refreshToken: string,
  ) {
    const updatedUser = await tx.user.update({
      where: { id: existingUser.id },
      data: { email: profile.emails[0].value },
    });

    await tx.oAuthProvider.update({
      where: {
        provider_providerUserId: {
          provider: existingUser.provider,
          providerUserId: existingUser.providerUserId,
        },
      },
      data: { accessToken, refreshToken },
    });
    return updatedUser;
  }

  async createUserByProviderUserId(
    tx: any,
    profile: any,
    provider: string,
    providerUserId: string,
    accessToken: string,
    refreshToken: string,
  ) {
    return tx.user.create({
      data: {
        email: profile.emails[0].value,
        oauthProviders: {
          create: {
            providerUserId: providerUserId,
            provider: provider,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        },
      },
    });
  }

  async updateOrInsertUserByProviderUserId(
    accessToken: string,
    refreshToken: string,
    provider: string,
    profile: any,
  ) {
    const googleID = profile.id;
    const user = await this.prisma.$transaction(async (tx) => {
      const existingOAuth = await this.findUserByProviderUserId(
        tx,
        provider,
        googleID,
      );

      if (existingOAuth) {
        return this.updateUserProfileAndTokens(
          tx,
          existingOAuth,
          profile,
          accessToken,
          refreshToken,
        );
      } else {
        return this.createUserByProviderUserId(
          tx,
          profile,
          provider,
          googleID,
          accessToken,
          refreshToken,
        );
      }
    });
    return user;
  }
}
