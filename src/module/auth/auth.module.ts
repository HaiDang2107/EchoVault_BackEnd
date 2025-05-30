import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport'; // Passport để xác thực
import { JwtModule, JwtService } from '@nestjs/jwt'; // Để tạo JWT token
import { UserModule } from '../user/user.module'; // Module người dùng (module User để lưu trữ thông tin người dùng)
import { MailModule } from '../mail/mail.module';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/role.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';

@Module({
  imports: [
    forwardRef(()=> UserModule),
    MailModule,
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
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    LocalAuthGuard,
  ],
  exports: [JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
