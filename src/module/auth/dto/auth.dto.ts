import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class AuthDto {
    @IsEmail() // must be a valid email
    @IsNotEmpty() // not allow to be empty
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}