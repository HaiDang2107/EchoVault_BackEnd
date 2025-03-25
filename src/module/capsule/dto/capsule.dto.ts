import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDate, IsInt, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

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

    
    @IsNotEmpty()
    @IsArray()
    @IsUUID('4', { each: true })
    contributors!: string[]; // Array of contributors

    @IsNotEmpty()
    @IsArray()
    @IsUUID('4', { each: true })
    viewers!: string[]; // Array of contributors

    @IsString()
    @IsNotEmpty()
    theme?: string; // Background theme of the capsule

    @IsString()
    @IsNotEmpty()
    description!: string; // Description of the capsule

    @IsOptional()
    @IsArray()
    recallQuestions?: NewRecallQuestionDto[]; // Array of recall questions (max 4 questions)

    @IsInt()
    @Min(1)
    @Max(30) // Assuming the interval is in days (1 day to 30 day)
    notificationInterval!: number; // Time interval (in days) for notifications

    
    @IsNotEmpty()
    @Transform(({ value }) => {
        const [time, date] = value.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const [month, day, year] = date.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      })
    openingTime!: Date; // The specific time when the capsule can be opened
}

export class NewRecallQuestionDto{
    @IsUUID()
    capsuleId!: string; // The ID of the capsule

    @IsNotEmpty()
    @IsString()
    question!: string; // The recall question

    @IsNotEmpty()
    @IsString()
    choicesA!: string; // The recall answer

    @IsNotEmpty()
    @IsString()
    choicesB!: string; // The recall answer

    @IsNotEmpty()
    @IsString()
    choicesC!: string; // The recall answer

    @IsNotEmpty()
    @IsString()
    choicesD!: string; // The recall answer

    @IsNotEmpty()
    @IsString()
    correctAnswer!: string; // The correct answer

    @IsString()
    @IsOptional()
    explaination?: string; // Explanation of the recall question
}

