import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'The username' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'The password' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ description: 'The display name' })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  role?: string;
}
