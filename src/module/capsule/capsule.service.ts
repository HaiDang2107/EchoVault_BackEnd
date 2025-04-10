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
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
  CapsuleDto,
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
          createdAt: new Date('yyyy-MM-dd HH:mm:ss'), // Convert to UTC
          status: 'Locked', // Default status
        },
      });
  
      // Step 4: Add the owner as a viewer (if the capsule is private)
      if (dto.privacy === 'Private') {
        // Ensure viewers are provided for private capsules
        if (!dto.viewers || dto.viewers.length === 0) {
          throw new BadRequestException('Viewers must be provided for private capsules.');
        }
  
  
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
        uploadedAt: new Date('yyyy-MM-dd HH:mm:ss'), // Convert to UTC
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
      SELECT * FROM get_capsule_reactions(${capsuleId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: reactions,
    } as ApiResponseDto;
  }

  async getCapsuleComments(capsuleId: string): Promise<ApiResponseDto> {
    const comments = await this.prisma.$queryRaw`
      SELECT * FROM get_capsule_comments(${capsuleId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: comments,
    } as ApiResponseDto;
  }

  // Create Advertisement
  async createAdvertisement(dto: CreateAdvertisementDto): Promise<ApiResponseDto> {
    const advertisement = await this.prisma.advertisement.create({
      data: {
        title: dto.title,
        mediaUrl: dto.mediaUrl,
        targetUrl: dto.targetUrl,
        displayOrder: dto.displayOrder ?? 0,
      },
    });

    return {
      statusCode: 200,
      message: 'Advertisement created successfully.',
      data: advertisement,
    } as ApiResponseDto;
  }

  // Update Advertisement
  async updateAdvertisement(
    id: string,
    dto: UpdateAdvertisementDto,
  ): Promise<ApiResponseDto> {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id },
    });

    if (!advertisement) {
      throw new NotFoundException('Advertisement not found.');
    }

    const updatedAdvertisement = await this.prisma.advertisement.update({
      where: { id },
      data: {
        title: dto.title ?? advertisement.title,
        mediaUrl: dto.mediaUrl ?? advertisement.mediaUrl,
        targetUrl: dto.targetUrl ?? advertisement.targetUrl,
        displayOrder: dto.displayOrder ?? advertisement.displayOrder,
        isActive: dto.isActive ?? advertisement.isActive,
      },
    });

    return {
      statusCode: 200,
      message: 'Advertisement updated successfully.',
      data: updatedAdvertisement,
    } as ApiResponseDto;
  }

  async getCapsulesDashboard (userId: string, page: number, limit: number, statusFilter?: string): Promise<ApiResponseDto> {
    const capsules = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM get_capsule_dashboard(
      ${userId}::uuid,
      ${page}::int,
      ${limit}::int,
      ${statusFilter ?? null}::text
    );
    `;

    console.log("capsule",capsules);

    // Fetch active advertisements
    const advertisements = await this.prisma.$queryRaw<any[]>`
    SELECT * FROM get_active_advertisements();
  `;

  // Inject ads after every X capsules
  const INSERT_AFTER = 2;
  const result: any[] = [];
  let adIndex = 0;

  

  if(capsules != null){
    capsules.forEach((capsule, index) => {
      result.push({ type: 'capsule', data: capsule });
  
      // After every X capsules, insert one ad
      if ((index + 1) % INSERT_AFTER === 0 && advertisements.length > 0) {
        const ad = advertisements[adIndex % advertisements.length]; // loop ads
        result.push({ type: 'ad', data: ad });
        adIndex++;
      }
    });
  }
  

    return {
      statusCode: 200,
      message: 'Success',
      data: result,
    } as ApiResponseDto;
  }
}
