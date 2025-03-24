import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NewCapsuleDto } from "./dto/capsule.dto";
import * as argon from 'argon2'

@Injectable()
export class CapsuleService{
    constructor(private prisma: PrismaService){

    }

    
}