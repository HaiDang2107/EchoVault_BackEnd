import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthDto } from './dto';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interface/jwt-payload.interface';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async signup(dto: AuthDto) {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await this.userService.findUserByEmail(dto.email);
    if (existingUser) {
      throw new Error('Username already exists'); // Lỗi nếu tên người dùng đã tồn tại
    }

    //Generate password hash using argon 2
    const hash = await argon2.hash(dto.password);

    //save new user
    const user = await this.userService.createUser(dto.email, hash);

    //Return saved user
    return user;
  }

  // Phương thức cấp JWT token cho người dùng sau khi login
  async login(user: User) {
    const payload: JwtPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
    }; // Tạo payload cho JWT token

    // Tạo token và trả về cho người dùng
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('jwt.expiresIn'), // Lấy expiresIn từ ConfigService
      }),
    };
  }

  // Method gửi link tới email của user
  async requestPasswordReset(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new NotFoundException('Email không tồn tại');

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 tiếng

    await this.userService.createPasswordResetToken(token, user.id, expiresAt);

    const resetLink = `https://your-frontend.com/reset-password?token=${token}`;
    const subject = 'Reset your password';
    const html = `Click this link to reset your password: <a href="${resetLink}">${resetLink}</a>`;

    await this.mailService.sendMail(user.email, subject, html);

    return { message: 'Đã gửi email đặt lại mật khẩu' };
  }

  // Method reset lại password
  async resetPassword(token: string, newPassword: string) {
    const record = await this.userService.findUserByPasswordResetToken(token);

    if (!record || !record.expiresAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Token is invalid or expired');
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.userService.updateUserByUserId(record.userId, passwordHash);
    await this.userService.deletePasswordResetToken(token);
  }
}
