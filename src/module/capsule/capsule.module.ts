import { Module } from "@nestjs/common";
import { CapsuleController } from "./capsule.controller";
import { CapsuleService } from "./capsule.service";
import { PrismaModule } from '../prisma/prisma.module';
import { OpenCapsuleService } from "./open-capsule.service";
import { CapsuleMediaService } from "./capsule-media.service";
import { CapsuleMediaController } from "./capsule-media.controller";


@Module({
    imports: [PrismaModule],
    controllers: [CapsuleController, CapsuleMediaController],
    providers: [CapsuleService, OpenCapsuleService, CapsuleMediaService],
})
export class CapsuleModule {}