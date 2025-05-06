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

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        timezone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(email: string, password: string, displayName: string) {
    return this.prisma.user.create({
      data: {
        email: email,
        passwordHash: password,
        displayName: displayName,
      },
    });
  }

  async updateUserByUserId(userId: string, passwordHash: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: passwordHash },
    });
  }

  async findUserByProviderUserId(provider: string, providerUserId: string) {
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

  async createPasswordResetToken(
    token: string,
    userId: string,
    expiresAt: Date,
  ) {
    return this.prisma.passwordResetToken.create({
      data: {
        token: token,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
  }

  async findUserByPasswordResetToken(token: string) {
    return this.prisma.passwordResetToken.findUnique({
      where: { token: token },
      include: { user: true },
    });
  }

  async deletePasswordResetToken(token: string) {
    await this.prisma.passwordResetToken.delete({ where: { token: token } });
  }

  async createSession(userId: string, sessionToken: string, ipAddress?: string, userAgent?: string) {

    const session = await this.prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    });

    return session;
  }

  async deleteSession(sessionToken: string): Promise<void> {
    try {
      await this.prisma.userSession.delete({
        where: { sessionToken },
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Session not found or already deleted');
    }
  }

  async getSessionsByUserId(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, 
    });
  }
  
}
