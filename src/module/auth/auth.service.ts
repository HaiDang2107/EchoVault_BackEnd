import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interface/jwt-payload.interface';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  validateUser(payload: JwtPayload): any;
  validateUser(email: string, password: string): any;

  async validateUser(param1: any, param2?: any) {
    if (typeof param1 === 'string' && typeof param2 === 'string') {
      const user = await this.userService.findUserByEmail(param1);
      if (!user) {
        return null; // Trả về null nếu không tìm thấy user
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, param2);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } else {
      const { username } = param1;

      const user = await this.userService.findUserByEmail(username);
      if (!user) {
        return null; // Trả về null nếu không tìm thấy user
      }

      return user;
    }
  }

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
  async login(user: any) {
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
