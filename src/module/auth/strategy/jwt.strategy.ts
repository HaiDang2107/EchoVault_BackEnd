// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      // cấu hình chiến lược JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Trích xuất JWT từ header
      secretOrKey: configService.get<string>('jwt.secret'), // Lấy từ .env
      ignoreExpiration: false, // Không bỏ qua expiration, giúp kiểm tra token hết hạn
    });
  }

  // Hàm validate kiểm tra người dùng có hợp lệ hay không, tự động được gọi
  async validate(payload: JwtPayload) {
    // Kiểm tra người dùng từ cơ sở dữ liệu hoặc service
    const { username, sessionToken, sub, role } = payload;

    const user = await this.userService.getUserById(sub);
    if (!user) {
      return new Error('User not found');
    }

    const session = await this.userService.getSessionsByUserId(user.id);

    if (!session) {
      throw new Error('Session not found');
    }

    if (user.email !== username || user.role !== role || session[0].sessionToken !== sessionToken || session[0].expiresAt!.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired or something else');
    }



    return user;
  }
}