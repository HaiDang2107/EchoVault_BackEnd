import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Tìm người dùng theo username
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ // find in User table
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
}
