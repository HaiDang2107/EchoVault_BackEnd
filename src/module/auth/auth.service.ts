import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interface/jwt-payload.interface';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  // Phương thức cấp JWT token cho người dùng
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
}
