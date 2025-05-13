import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApiResponseDto } from "./dto/response.dto";

@Injectable()
export class AiService {
    constructor(private prisma: PrismaService){}


}