import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDate, IsInt, IsUrl, IsBoolean, Max, Min } from 'class-validator';

export class NewCapsuleDto {
    @IsString()
    @IsNotEmpty()
    content!: string; // The main content of the capsule

    
    @IsNotEmpty()
    @IsArray()
    @IsUUID('4', { each: true })
    contributors?: string[]; // Array of contributors

    @IsArray()
    @IsUUID('4', { each: true })
    viewers?: string[]; // Array of contributors

    @IsString()
    @IsNotEmpty()
    theme?: string; // Background theme of the capsule

    @IsString()
    @IsNotEmpty()
    description!: string; // Description of the capsule

    @IsString()
    @IsNotEmpty()
    privacy!: string; //Visibility of the capsule (e.g., "public", "private")

    @IsOptional()
    @IsArray()
    recallQuestions?: NewRecallQuestionDto[]; // Array of recall questions (max 4 questions)

    @IsInt()
    @Min(1)
    @Max(30) // Assuming the interval is in days (1 day to 30 day)
    notificationInterval!: number; // Time interval (in days) for notifications

    
    @IsDate()
    @IsNotEmpty()
    openingTime!: Date;
}

export class CapsuleDto{
    @IsUUID()
    capsuleId!: string; // The ID of the capsule

    @IsString()
    @IsNotEmpty()
    content!: string; // The main content of the capsule

    @IsString()
    @IsNotEmpty()
    theme!: string; // Background theme of the capsule

    @IsNotEmpty()
    notificationInteval!: number; // Time interval (in days) for notifications

    @IsDate()
    openingTime!: Date; // Opening time of the capsule

    @IsString()
    @IsNotEmpty()
    description!: string; // Description of the capsule

    @IsString()
    @IsNotEmpty()
    privacy!: string; //Visibility of the capsule (e.g., "public", "private")


    @IsArray()
    @IsUUID('4', { each: true })
    viewers?: string[]; // Array of contributors
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
  
    @IsString()
    @IsNotEmpty()
    commentText!: string; // The text of the comment
}

export class GiveReactionDto {
    @IsUUID()
    capsuleId!: string; // The ID of the capsule being reacted to
  
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

export class CreateAdvertisementDto {
    @IsString()
    title!: string; // Title of the advertisement
  
    @IsUrl()
    mediaUrl!: string; // Media URL for the advertisement
  
    @IsOptional()
    @IsUrl()
    targetUrl?: string; // Optional target URL for the advertisement
  
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number; // Optional display order (default is 0)
  }
  
export class UpdateAdvertisementDto {
    @IsOptional()
    @IsString()
    title?: string; // Optional title for the advertisement
  
    @IsOptional()
    @IsUrl()
    mediaUrl?: string; // Optional media URL for the advertisement
  
    @IsOptional()
    @IsUrl()
    targetUrl?: string; // Optional target URL for the advertisement
  
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number; // Optional display order
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean; // Optional flag to activate or deactivate the advertisement
  }

  