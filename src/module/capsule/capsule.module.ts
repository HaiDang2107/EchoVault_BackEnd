import { Module } from "@nestjs/common";
import { CapsuleController } from "./capsule.controller";
import { CapsuleService } from "./capsule.service";
import { PrismaModule } from '../prisma/prisma.module';


@Module({
    imports: [PrismaModule],
    controllers: [CapsuleController],
    providers: [CapsuleService],
})
export class CapsuleModule {}