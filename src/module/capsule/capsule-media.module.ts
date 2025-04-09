// capsule-media.module.ts
import { Module } from '@nestjs/common';
import { CapsuleMediaService } from './capsule-media.service';
import { CapsuleMediaController } from './capsule-media.controller';

@Module({
  providers: [CapsuleMediaService, PrismaService],
  controllers: [CapsuleMediaController],
  exports: [CapsuleMediaService],
})
export class CapsuleMediaModule {}
