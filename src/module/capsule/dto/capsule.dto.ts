import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDate, IsInt, IsUrl, IsBoolean, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewCapsuleDto {
  @ApiProperty({ description: 'The main content of the capsule' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ type: [String], description: 'UUIDs of contributors' })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  contributors?: string[];

  @ApiProperty({ type: [String], description: 'UUIDs of viewers' })
  @IsArray()
  @IsUUID('4', { each: true })
  viewers?: string[];

  @ApiProperty({ description: 'Background theme of the capsule' })
  @IsString()
  @IsNotEmpty()
  theme?: string;

  @ApiProperty({ description: 'Description of the capsule' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Visibility of the capsule', enum: ['public', 'private'] })
  @IsString()
  @IsNotEmpty()
  privacy!: string;

  @ApiProperty({ type: () => [NewRecallQuestionDto], required: false })
  @IsOptional()
  @IsArray()
  recallQuestions?: NewRecallQuestionDto[];

  @ApiProperty({ description: 'Notification interval in days', minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  notificationInterval!: number;

  @ApiProperty({ description: 'Opening time of the capsule', type: String, format: 'date-time' })
  @IsDate()
  @IsNotEmpty()
  openingTime!: Date;
}

export class CapsuleDto {
  @ApiProperty({ description: 'ID of the capsule' })
  @IsUUID()
  capsuleId!: string;

  @ApiProperty({ description: 'The main content of the capsule' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'Background theme of the capsule' })
  @IsString()
  @IsNotEmpty()
  theme!: string;

  @ApiProperty({ description: 'Notification interval in days' })
  @IsNotEmpty()
  notificationInteval!: number;

  @ApiProperty({ description: 'Opening time of the capsule', type: String, format: 'date-time' })
  @IsDate()
  openingTime!: Date;

  @ApiProperty({ description: 'Description of the capsule' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Visibility of the capsule' })
  @IsString()
  @IsNotEmpty()
  privacy!: string;

  @ApiProperty({ type: [String], description: 'UUIDs of viewers' })
  @IsArray()
  @IsUUID('4', { each: true })
  viewers?: string[];
}

export class NewRecallQuestionDto {
  @ApiProperty({ description: 'ID of the capsule' })
  @IsUUID()
  capsuleId!: string;

  @ApiProperty({ description: 'The recall question' })
  @IsNotEmpty()
  @IsString()
  question!: string;

  @ApiProperty({ description: 'Answer choice A' })
  @IsNotEmpty()
  @IsString()
  choicesA!: string;

  @ApiProperty({ description: 'Answer choice B' })
  @IsNotEmpty()
  @IsString()
  choicesB!: string;

  @ApiProperty({ description: 'Answer choice C' })
  @IsNotEmpty()
  @IsString()
  choicesC!: string;

  @ApiProperty({ description: 'Answer choice D' })
  @IsNotEmpty()
  @IsString()
  choicesD!: string;

  @ApiProperty({ description: 'Correct answer' })
  @IsNotEmpty()
  @IsString()
  correctAnswer!: string;

  @ApiProperty({ description: 'Explanation of the recall question', required: false })
  @IsString()
  @IsOptional()
  explaination?: string;
}

export class GiveCommentDto {
  @ApiProperty({ description: 'Capsule ID being commented on' })
  @IsUUID()
  capsuleId!: string;

  @ApiProperty({ description: 'Text of the comment' })
  @IsString()
  @IsNotEmpty()
  commentText!: string;
}

export class GiveReactionDto {
  @ApiProperty({ description: 'Capsule ID being reacted to' })
  @IsUUID()
  capsuleId!: string;

  @ApiProperty({ description: 'Type of reaction (like, love, laugh)' })
  @IsString()
  @IsNotEmpty()
  reactionType!: string;
}

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Question ID being answered' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ description: 'User selected answer' })
  @IsString()
  answer!: string;
}

export class CreateAdvertisementDto {
  @ApiProperty({ description: 'Title of the advertisement' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Media URL for the advertisement' })
  @IsUrl()
  mediaUrl!: string;

  @ApiProperty({ description: 'Target URL for the advertisement', required: false })
  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @ApiProperty({ description: 'Display order of the ad (default 0)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateAdvertisementDto {
  @ApiProperty({ description: 'Updated title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Updated media URL', required: false })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @ApiProperty({ description: 'Updated target URL', required: false })
  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @ApiProperty({ description: 'Updated display order', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Flag to activate or deactivate', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
