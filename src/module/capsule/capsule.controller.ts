import { Controller, Post, Body } from "@nestjs/common";
import { CapsuleService } from "./capsule.service";
import { CapsuleDto } from "./dto/capsule.dto";

@Controller('capsule')
export class CapsuleController{
    constructor(private capsuleService: CapsuleService) {}

    @Post('SignUp')
    signup(@Body() dto: CapsuleDto) {
        console.log({
            dto,
        })
        return this.capsuleService.signup(dto);
    }

}