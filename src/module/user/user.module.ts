import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Export để sử dụng trong các module khác
})
export class UserModule {}
