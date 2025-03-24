import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport'; // Passport để xác thực
import { JwtModule } from '@nestjs/jwt'; // Để tạo JWT token
import { UserModule } from '../user/user.module'; // Module người dùng (module User để lưu trữ thông tin người dùng)
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'), // Lấy từ config/jwt.config.ts
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  // Nếu 1 Guard được áp dụng cho tất cả các controller thì cần thêm Guard đó vào mảng providers
})
export class AuthModule {}
