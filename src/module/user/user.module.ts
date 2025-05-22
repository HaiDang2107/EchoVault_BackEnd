import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => AuthModule), // Để tránh vòng lặp giữa các module
  ],
  controllers: [UserController],
  providers: [PrismaService, UserService],
  exports: [UserService], // Export để sử dụng trong các module khác
})
export class UserModule {}
