import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsEnum } from 'class-validator';

export enum NotificationType {
    CapsuleOpening = 'CapsuleOpening',
    FriendRequest = 'FriendRequest',
    NewComment = 'NewComment',
    NewReaction = 'NewReaction',
  }

export class NewNotificationDto {
  @ApiProperty({
    description: 'The ID of the user receiving the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: 'The ID of the capsule associated with the notification',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  @IsString()
  capsuleId!: string;

  @ApiProperty({
    description: 'The type of notification',
    example: NotificationType.CapsuleOpening,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType, {
    message: `notificationType must be one of: ${Object.values(NotificationType).join(', ')}`,
  })
  notificationType!: NotificationType;


  @ApiProperty({
    description: 'The message content of the notification',
    example: 'Your capsule will be openable on 2025-05-07T12:00:00.000Z',
  })
  @IsNotEmpty()
  @IsString()
  message!: string;

  @ApiProperty({
    description: 'The time the notification is scheduled to be sent',
    example: '2025-05-07T12:00:00.000Z',
  })
  @IsNotEmpty()
  @IsString()
  notiTime!: Date;

  @ApiProperty({
    description: 'Indicates whether the notification has been sent',
    example: false,
  })
  @IsNotEmpty()
  isSent!: boolean;

  @ApiProperty({
    description: 'Indicates whether the notification has been read by the user',
    example: false,
  })
  @IsNotEmpty()
  isRead!: boolean;
}


