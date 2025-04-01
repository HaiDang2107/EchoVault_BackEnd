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

  async createCapsule(dto: Omit<NewCapsuleDto, 'userId'>, userId: string): Promise<ApiResponseDto> {
    return await this.prisma.$transaction(async (prisma) => {
      // Step 1: Create the capsule
      const capsule = await prisma.capsule.create({
        data: {
          userId, // Set the owner of the capsule
          content: dto.content,
          theme: dto.theme ?? '',
          description: dto.description,
          privacy: dto.privacy,
          notificationInterval: dto.notificationInterval,
          openingTime: dto.openingTime,
          createdAt: new Date(formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss')), // Convert to UTC
          status: 'Locked', // Default status
        },
      });
  
      // Step 2: Add the owner as a contributor
      await prisma.capsuleContributor.create({
        data: {
          capsuleId: capsule.id,
          userId, // Owner's userId
        },
      });
  
      // Step 3: Add contributors (if any)
      if (dto.contributors && dto.contributors.length > 0) {
        await prisma.capsuleContributor.createMany({
          data: dto.contributors.map((contributorId) => ({
            capsuleId: capsule.id,
            userId: contributorId,
          })),
        });
      }
  
      // Step 4: Add the owner as a viewer (if the capsule is private)
      if (dto.privacy === 'Private') {
        // Ensure viewers are provided for private capsules
        if (!dto.viewers || dto.viewers.length === 0) {
          throw new BadRequestException('Viewers must be provided for private capsules.');
        }
  
        // Add the owner as a viewer
        await prisma.capsuleViewer.create({
          data: {
            capsuleId: capsule.id,
            userId, // Owner's userId
          },
        });
  
        // Add other viewers
        await prisma.capsuleViewer.createMany({
          data: dto.viewers.map((viewerId) => ({
            capsuleId: capsule.id,
            userId: viewerId,
          })),
        });
      }
  
      // Step 5: Create recall questions
      if (dto.recallQuestions && dto.recallQuestions.length > 0) {
        for (const questionDto of dto.recallQuestions) {
          await prisma.recallQuestion.create({
            data: {
              capsuleId: capsule.id,
              question: questionDto.question,
              choicesA: questionDto.choicesA,
              choicesB: questionDto.choicesB,
              choicesC: questionDto.choicesC,
              choicesD: questionDto.choicesD,
              correctAnswer: questionDto.correctAnswer,
              explaination: questionDto.explaination ?? '',
            },
          });
        }
      }
  
      // Return success response
      return { statusCode: 201, message: 'Capsule created successfully.' } as ApiResponseDto;
    });
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
  async giveComment(dto: Omit<GiveCommentDto, 'userId'>, userId: string): Promise<ApiResponseDto> {
    await this.prisma.capsuleComments.create({
      data: {
        capsuleId: dto.capsuleId,
        userId, // Use the userId passed from the controller
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
  async giveReaction(dto: Omit<GiveReactionDto, 'userId'>, userId: string): Promise<ApiResponseDto> {
    // Ensure that the user can only react once per capsule
    const existingReaction = await this.prisma.capsuleReactions.findUnique({
      where: {
        capsuleId_userId: {
          capsuleId: dto.capsuleId,
          userId, // Use the userId passed from the controller
        },
      },
    });
  
    if (existingReaction) {
      // Update the reaction if it already exists
      await this.prisma.capsuleReactions.update({
        where: {
          capsuleId_userId: {
            capsuleId: dto.capsuleId,
            userId,
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
        userId, // Use the userId passed from the controller
        reactionType: dto.reactionType,
        createdAt: new Date(formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss')),
      },
    });
  
    return {
      statusCode: 200,
      message: 'Reaction added successfully',
    } as ApiResponseDto;
  }

  async getUserCapsules(userId: string): Promise<ApiResponseDto> {
    const capsules = await this.prisma.$queryRaw`
      SELECT * FROM getUserCapsules(${userId}::uuid);
    `;
    return {
      statusCode: 200,  
      message: 'Success',
      data: capsules,
    } as ApiResponseDto;
  }

  async getCapsuleContributors(capsuleId: string): Promise<ApiResponseDto> {
    const contributors = await this.prisma.capsuleContributor.findMany({
      where: { capsuleId },
      select: { userId: true },
    });
    return {
      statusCode: 200,  
      message: 'Success',
      data: contributors.map((contributor) => contributor.userId),
    } as ApiResponseDto;
  }

  async getCapsuleViewers(capsuleId: string): Promise<ApiResponseDto> {
    const viewers = await this.prisma.capsuleViewer.findMany({
      where: { capsuleId },
      select: { userId: true },
    });
    return {
      statusCode: 200,
      message: 'Success',
      data: viewers.map((viewer) => viewer.userId),
    } as ApiResponseDto;
  }

  async getCapsuleQuestions(capsuleId: string): Promise<ApiResponseDto> {
    const questions = await this.prisma.recallQuestion.findMany({
      where: { capsuleId },
    });
    return {
      statusCode: 200,
      message: 'Success',
      data: questions,
    } as ApiResponseDto;
  }

  async getCapsuleMedia(capsuleId: string): Promise<ApiResponseDto> {
    const media = await this.prisma.capsuleMedia.findMany({
      where: { capsuleId },
    });
    return {
      statusCode: 200,
      message: 'Success',
      data: media,
    } as ApiResponseDto;
  }

  async getCapsuleReactions(capsuleId: string): Promise<ApiResponseDto> {
    const reactions = await this.prisma.$queryRaw`
      SELECT * FROM getCapsuleReactions(${capsuleId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: reactions,
    } as ApiResponseDto;
  }

  async getCapsuleComments(capsuleId: string): Promise<ApiResponseDto> {
    const comments = await this.prisma.$queryRaw`
      SELECT * FROM getCapsuleComments(${capsuleId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: comments,
    } as ApiResponseDto;
  }

  async getUserFriends(userId: string): Promise<ApiResponseDto> {
    const friends = await this.prisma.$queryRaw`
      SELECT * FROM getUserFriends(${userId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: friends,
    } as ApiResponseDto;
  }

  async getNotifications(userId: string): Promise<ApiResponseDto> {
    const notifications = await this.prisma.$queryRaw`
      SELECT * FROM getNotifications(${userId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: notifications,
    } as ApiResponseDto;
  }
}
