import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { PrismaModule } from './module/prisma/prisma.module';
import jwtConfig from './config/jwt.config'; // Import file jwt.config.ts

@Module({
  imports: [
    AuthModule, 
    UserModule, 
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép truy cập biến môi trường ở mọi nơi
      load: [jwtConfig], // Load config từ jwt.config.ts
    }),],
})
export class AppModule {}
