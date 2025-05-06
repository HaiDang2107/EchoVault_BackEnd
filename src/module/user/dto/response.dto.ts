import { IsString, IsUUID, IsDate, IsInt, IsArray } from 'class-validator';

export class ApiResponseDto {
    @IsInt()
    statusCode!: number;

    @IsString()
    message!: string;

    @IsString()
    data?: any;
}