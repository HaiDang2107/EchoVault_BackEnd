import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'

@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService){

    }
    login(){
        return {msg: 'Login sucessfully'}
    }

    async signup(dto: AuthDto){
        //Generate password hash using argon 2
        const hash = await argon.hash(dto.password);

        //save new user
        const user = await this.prisma.user.create({
            data:{
                email: dto.email,
                passwordHash: hash
            },
        })

        //Return saved user
        return user
    }
}