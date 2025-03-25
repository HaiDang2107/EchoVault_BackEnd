import { IsString, IsUUID, IsDate, IsInt, IsArray } from 'class-validator';

export class ApiResponseDto {
    @IsInt()
    statusCode!: number;

    @IsString()
    message!: string;

    @IsString()
    data?: any;
}

export class OpenedCapsuleDto {
    @IsUUID()
    id!: string;

    @IsUUID()
    userId!: string;

    @IsString()
    content!: string;

    @IsString()
    imageUrls!: string;

    @IsString()
    theme!: string;

    @IsString()
    description!: string;

    @IsInt()
    notificationInterval!: number;

    @IsDate()
    openingTime!: Date;

    @IsString()
    status!: string;

    @IsArray()
    contributors!: string[];

    @IsArray()
    viewers!: string[];

    @IsArray()
    recallQuestions!: any[];
}

export class OpenedCapsuleInfoResponseDto {
    @IsInt()
    statusCode!: number;

    @IsString()
    message!: string;

    openedCapsule!: OpenedCapsuleDto;
}

export class LockedCapsuleDto {
    @IsUUID()
    id!: string;

    @IsUUID()
    userId!: string;

    @IsString()
    theme!: string;

    @IsString()
    description!: string;

    @IsInt()
    notificationInterval!: number;

    @IsDate()
    openingTime!: Date;

    @IsString()
    status!: string;

    @IsArray()
    contributors!: string[];

    @IsArray()
    viewers!: string[];
}

export class LockedCapsuleInfoResponseDto {
    @IsInt()
    statusCode!: number;

    @IsString()
    message!: string;

    lockedCapsule!: LockedCapsuleDto;
}