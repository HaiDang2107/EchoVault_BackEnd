// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({ // cấu hình chiến lược JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Trích xuất JWT từ header
      secretOrKey: configService.get<string>('jwt.secret'), // Lấy từ .env
      ignoreExpiration: false, // Không bỏ qua expiration, giúp kiểm tra token hết hạn
    });
  }

  // Hàm validate kiểm tra người dùng có hợp lệ hay không
  async validate(payload: JwtPayload) {
    // Kiểm tra người dùng từ cơ sở dữ liệu hoặc service
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
    return user;
  }
}
