import { Module } from "@nestjs/common";
import { CapsuleController } from "./capsule.controller";
import { CapsuleService } from "./capsule.service";

@Module({
    controllers: [CapsuleController],
    providers: [CapsuleService],
})
export class CapsuleModule {

}