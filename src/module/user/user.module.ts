import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, UserService],
  exports: [UserService], // Export để sử dụng trong các module khác
})
export class UserModule {}
