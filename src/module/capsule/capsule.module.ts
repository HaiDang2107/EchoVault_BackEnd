import { Module } from "@nestjs/common";
import { CapsuleController } from "./capsule.controller";
import { CapsuleService } from "./capsule.service";
import { PrismaModule } from '../prisma/prisma.module';
import { OpenCapsuleService } from "./open-capsule.service";
import { MulterModule } from '@nestjs/platform-express';
import multer, {File} from 'multer';

@Module({
    imports: [PrismaModule, 
        MulterModule.register({
      storage: multer.memoryStorage(), // Lưu file vào memory, hoặc dùng diskStorage để lưu vào đĩa
    }),
    ],
    controllers: [CapsuleController],
    providers: [CapsuleService, OpenCapsuleService],
})
export class CapsuleModule {}