import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/prisma.service';
import {
  NewCapsuleDto,
  NewRecallQuestionDto,
  GiveCommentDto,
  GiveReactionDto,
} from './dto/capsule.dto';
import {
  OpenedCapsuleInfoResponseDto,
  LockedCapsuleInfoResponseDto,
  ApiResponseDto,
} from './dto/response.dto';
import {
  CapsuleNotFoundException,
  CapsuleNotOpenedException,
} from './exceptions/capsule.exception';
import {formatInTimeZone} from 'date-fns-tz';

const timeZone = 'Asia/Bangkok'; // GMT+7

@Injectable()
export class CapsuleService {
  constructor(private prisma: PrismaService) {}

  async createCapsule(dto: NewCapsuleDto): Promise<ApiResponseDto> {
    const capsule = await this.prisma.capsule.create({
      data: {
        userId: dto.userId,
        content: dto.content,
        theme: dto.theme ?? '',
        description: dto.description,
        notificationInterval: dto.notificationInterval,
        openingTime: dto.openingTime,
        createdAt: new Date(formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss')), // Convert to UTC
        status: 'Locked', // Default status
      },
    });

    // Create contributors
    if (dto.contributors && dto.contributors.length > 0) {
      await this.prisma.capsuleContributor.createMany({
        data: dto.contributors.map((userId) => ({
          capsuleId: capsule.id,
          userId,
        })),
      });
    }

    // Create viewers
    if (dto.viewers && dto.viewers.length > 0) {
      await this.prisma.capsuleViewer.createMany({
        data: dto.viewers.map((userId) => ({
          capsuleId: capsule.id,
          userId,
        })),
      });
    }

    // Create recall questions
    if (dto.recallQuestions && dto.recallQuestions.length > 0) {
      for (const questionDto of dto.recallQuestions) {
        await this.createRecallQuestion({
          ...questionDto,
          capsuleId: capsule.id,
        });
      }
    }

    return { statusCode: 200, message: 'Success' } as ApiResponseDto;
  }

  async storeMedia(
    capsuleId: string,
    userId: string,
    mediaUrls: string[],
  ): Promise<void> {
    await this.prisma.capsuleMedia.createMany({
      data: mediaUrls.map((mediaUrl) => ({
        capsuleId,
        mediaUrl,
        mediaType: this.getMediaType(mediaUrl), // Determine media type (e.g., image, video)
        uploadedBy: userId,
        uploadedAt: new Date(formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss')), // Convert to UTC
      })),
    });
  }

  private getMediaType(mediaUrl: string): string {
    const extension = mediaUrl.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'mov', 'avi'].includes(extension)) {
      return 'video';
    } else if (['mp3', 'wav'].includes(extension)) {
      return 'audio';
    }
    return 'unknown';
  }

  async createRecallQuestion(dto: NewRecallQuestionDto) {
    return await this.prisma.recallQuestion.create({
      data: {
        capsuleId: dto.capsuleId,
        question: dto.question,
        choicesA: dto.choicesA,
        choicesB: dto.choicesB,
        choicesC: dto.choicesC,
        choicesD: dto.choicesD,
        correctAnswer: dto.correctAnswer,
        explaination: dto.explaination ?? '',
      },
    });
  }

  async deleteCapsule(
    capsuleId: string,
    userId: string,
  ): Promise<ApiResponseDto> {
    // Check if the capsule exists and its status is "Opened"
    const capsule = await this.prisma.capsule.findUnique({
      where: { id: capsuleId },
    });

    if (!capsule) {
      throw new CapsuleNotFoundException();
    }

    if (capsule.status !== 'Opened') {
      throw new CapsuleNotOpenedException();
    }

    // Delete the capsule
    await this.prisma.capsule.delete({
      where: { id: capsuleId },
    });

    return { statusCode: 200, message: 'Success' };
  }

  

  async getLockedCapsuleById(
    capsuleId: string,
    userId: string,
  ): Promise<LockedCapsuleInfoResponseDto> {
    const capsule = await this.prisma.capsule.findUnique({
      where: { id: capsuleId },
      include: {
        contributors: true,
        viewers: true,
        recallQuestions: true,
      },
    });

    if (!capsule) {
      throw new CapsuleNotFoundException();
    }

    return {
      statusCode: 200,
      message: 'Success',
      lockedCapsule: {
        id: capsule.id,
        userId: capsule.userId,
        theme: capsule.theme,
        description: capsule.description,
        notificationInterval: capsule.notificationInterval,
        openingTime: capsule.openingTime,
        status: capsule.status,
        contributors: capsule.contributors.map(
          (contributor) => contributor.userId,
        ),
        viewers: capsule.viewers.map((viewer) => viewer.userId),
      },
    } as LockedCapsuleInfoResponseDto;
  }

  // Service to handle adding a comment to a capsule
  async giveComment(dto: GiveCommentDto): Promise<ApiResponseDto> {
    await this.prisma.capsuleComments.create({
      data: {
        capsuleId: dto.capsuleId,
        userId: dto.userId,
        commentText: dto.commentText,
        createdAt: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: 'Comment added successfully',
    } as ApiResponseDto;
  }

  // Service to handle adding a reaction to a capsule
  async giveReaction(dto: GiveReactionDto): Promise<ApiResponseDto> {
    // Ensure that the user can only react once per capsule
    const existingReaction = await this.prisma.capsuleReactions.findUnique({
      where: {
        capsuleId_userId: {
          capsuleId: dto.capsuleId,
          userId: dto.userId,
        },
      },
    });
  
    if (existingReaction) {
      // Update the reaction if it already exists
      await this.prisma.capsuleReactions.update({
        where: {
          capsuleId_userId: {
            capsuleId: dto.capsuleId,
            userId: dto.userId,
          },
        },
        data: {
          reactionType: dto.reactionType,
          createdAt: new Date(formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss')),
        },
      });
  
      return {
        statusCode: 200,
        message: 'Reaction updated successfully',
      } as ApiResponseDto;
    }
  
    // Create a new reaction if it doesn't exist
    await this.prisma.capsuleReactions.create({
      data: {
        capsuleId: dto.capsuleId,
        userId: dto.userId,
        reactionType: dto.reactionType,
        createdAt: new Date(formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss')),
      },
    });
  
    return {
      statusCode: 200,
      message: 'Reaction added successfully',
    } as ApiResponseDto;
  }
}
