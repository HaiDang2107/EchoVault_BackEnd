import { Module} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { CapsuleModule } from './module/capsule/capsule.module';

import { PrismaModule } from './module/prisma/prisma.module';
import jwtConfig from './config/jwt.config'; // Import file jwt.config.ts
import redisConfig from './config/redis.config';
import { googleConfig } from './config/google.config';
import { ProfileModule } from './module/profile/profile.module';
import { AdminModule } from './module/admin/admin.module';

@Module({
  imports: [
    AuthModule, 
    UserModule, 
    PrismaModule,
    CapsuleModule,
    ProfileModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép truy cập biến môi trường ở mọi nơi
      load: [jwtConfig, googleConfig, redisConfig], // Load config từ jwt.config.ts
    }),
  ],
})
export class AppModule {}
