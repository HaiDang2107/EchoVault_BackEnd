import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDate, IsInt, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class NewCapsuleDto {
    @IsUUID()
    userId!: string; // The ID of the user creating the capsule

    @IsString()
    @IsNotEmpty()
    content!: string; // The main content of the capsule

    
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
    if (typeof value === 'string') {
        // Handle string input (e.g., "19:20 03:30:2025")
        const [time, date] = value.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const [month, day, year] = date.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    } else if (value instanceof Date) {
        // If the value is already a Date object, return it as-is
        return value;
    } else {
        throw new Error('Invalid openingTime format. Expected a string or Date object.');
    }
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

export class GiveCommentDto {
    @IsUUID()
    capsuleId!: string; // The ID of the capsule being commented on
  
    @IsUUID()
    userId!: string; // The ID of the user giving the comment
  
    @IsString()
    @IsNotEmpty()
    commentText!: string; // The text of the comment
}

export class GiveReactionDto {
    @IsUUID()
    capsuleId!: string; // The ID of the capsule being reacted to
  
    @IsUUID()
    userId!: string; // The ID of the user giving the reaction
  
    @IsString()
    @IsNotEmpty()
    reactionType!: string; // The type of reaction (e.g., "like", "love", "laugh")
}

export class SubmitAnswerDto {
    @IsUUID()
    questionId!: string; // The ID of the question being answered
  
    @IsString()
    answer!: string; // The user's selected answer
  }

  