import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDate, IsInt, Max, Min } from 'class-validator';

export class NewCapsuleDto {
    @IsUUID()
    userId!: string; // The ID of the user creating the capsule

    @IsString()
    @IsNotEmpty()
    content!: string; // The main content of the capsule

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageUrls?: string[]; // Array of image URLs (max 4 images)

    @IsString()
    @IsNotEmpty()
    theme?: string; // Background theme of the capsule

    @IsString()
    @IsNotEmpty()
    description!: string; // Description of the capsule

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    recallQuestions?: string[]; // Array of recall questions (max 4 questions)

    @IsInt()
    @Min(1)
    @Max(1440) // Assuming the interval is in minutes (1 minute to 24 hours)
    notificationInterval!: number; // Time interval (in minutes) for notifications

    @IsDate()
    @IsNotEmpty()
    openingTime!: Date; // The specific time when the capsule can be opened
}