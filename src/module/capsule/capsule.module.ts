import { Module } from "@nestjs/common";
import { CapsuleController } from "./capsule.controller";
import { CapsuleService } from "./capsule.service";
import { PrismaModule } from '../prisma/prisma.module';
import { OpenCapsuleService } from "./open-capsule.service";


@Module({
    imports: [PrismaModule],
    controllers: [CapsuleController],
    providers: [CapsuleService, OpenCapsuleService],
})
export class CapsuleModule {}