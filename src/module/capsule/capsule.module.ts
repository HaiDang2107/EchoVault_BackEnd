import { Module } from '@nestjs/common';
import { CapsuleController } from './capsule.controller';
import { CapsuleService } from './capsule.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenCapsuleService } from './open-capsule.service';
import { CapsuleMediaService } from './capsule-media.service';
import { CapsuleMediaController } from './capsule-media.controller';
import { GetCapsuleService } from './get-capsule.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [CapsuleController, CapsuleMediaController],
  providers: [
    CapsuleService,
    OpenCapsuleService,
    CapsuleMediaService,
    GetCapsuleService,
  ],
})
export class CapsuleModule {}
