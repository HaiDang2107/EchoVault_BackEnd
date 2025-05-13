import { IsString, IsInt } from 'class-validator';

export class ApiResponseDto {
    @IsInt()
    statusCode!: number;

    @IsString()
    message!: string;

    @IsString()
    data?: any;
}
