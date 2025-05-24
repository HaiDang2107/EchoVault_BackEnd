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
  DeleteCapsuleDto,
  CreateCapsuleDto,
  UpdateAvatarDto,
  UpdateAvatarCapsuleDto,
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
//import aws from 'aws-sdk';
import * as aws from 'aws-sdk';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import multer, {File} from 'multer';
import { NotificationService } from '../notification/notification.service';


const timeZone = 'Asia/Bangkok'; // GMT+7

@Injectable()

export class CapsuleService {
  private prisma: PrismaService;
  private s3: aws.S3; // Khai báo kiểu cụ thể

  constructor(
    prisma: PrismaService,
    private readonly notificationService: NotificationService, // Inject NotificationService
  ) {
    this.prisma = prisma;

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;

    if (!accessKeyId || !secretAccessKey || !region) {
      throw new Error('Missing AWS credentials or region in .env');
    }

    this.s3 = new aws.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });
  }
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
          createdAt: new Date(), // Convert to UTC
          status: 'Locked', // Default status
        },
      });
  
      // Step 2: Add the owner as a viewer (if the capsule is private)
      if (dto.privacy === 'Private') {
        // Ensure viewers are provided for private capsules
        if (!dto.viewers || dto.viewers.length === 0) {
          throw new BadRequestException('Viewers must be provided for private capsules.');
        }
        
        //Add the owner as a viewer
        await prisma.capsuleViewer.create({
          data: {
            capsuleId: capsule.id,
            userId: userId,
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
  
      // Step 3: Create recall questions
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

      // Step 4: Store media if provided
      if (dto.files && dto.files.length > 0) {

        for (const file of dto.files) {
          // Upload each file to S3
          const params = {
            Bucket: 'testecho123',
            Key: `capsules/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };

          const data = await this.s3.upload(params).promise();
          const imageUrl = data.Location;

          // Insert an instance in the CapsuleMedia table
          const media = await prisma.capsuleMedia.create({
            data: {
              mediaId: crypto.randomUUID(),
              capsuleId: capsule.id, // Use the capsule ID
              mediaUrl: imageUrl,
              mediaType: file.mimetype,
              uploadedBy: userId, // The user who uploaded the file
              uploadedAt: new Date(),
              metadata: '{"resolution": "1920x1080"}', // Example metadata
            },
          });

        }

      }
      
      //Step 5: Create notification for the capsule
      await this.notificationService.createScheduledNotificationsForCapsule(
        capsule.id,
        userId,
        dto.openingTime,
        dto.notificationInterval,
      );

      // Return success response
      return { statusCode: 201, message: 'Capsule created successfully.', capsuleID: capsule.id } as ApiResponseDto;
    });
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

  async deleteCapsule(dto: DeleteCapsuleDto): Promise<ApiResponseDto> {
    return await this.prisma.$transaction(async (prisma) => {
      // Step 1: Check if the capsule exists and belongs to the user
      const capsule = await prisma.capsule.findUnique({
        where: { id: dto.capsuleId },
      });
  
      if (!capsule) {
        throw new Error('Capsule not found');
      }
  
      if (capsule.userId !== dto.userId) {
        throw new Error('Unauthorized: You are not the owner of this capsule');
      }
  
      // Step 2: Delete the capsule (recallQuestions will be deleted automatically via onDelete: Cascade)
      await prisma.capsule.delete({
        where: { id: dto.capsuleId },
      });
  
      return {
        statusCode: 200,
        message: 'Capsule deleted successfully',
        data: null,
        success: true,
      };
    });
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
    type CapsuleReactions = {
      reactionId: string;
      userId: string;
      capsuleId: string;
      reactionType: string;
      createdAt: Date;
    };
    await this.prisma.$executeRawUnsafe(`BEGIN;`);
    await this.prisma.$executeRawUnsafe(`CALL get_capsule_reactions('${capsuleId}', 'reactioncursor');`);

    // Fetch the results from the cursor
    const fetchedReactions = (await this.prisma.$queryRawUnsafe(`FETCH ALL FROM reactioncursor;`)) as CapsuleReactions[];
    await this.prisma.$executeRawUnsafe(`COMMIT;`);
    return {
      statusCode: 200,
      message: 'Success',
      data: fetchedReactions,
    } as ApiResponseDto;
  }

  async getCapsuleComments(capsuleId: string): Promise<ApiResponseDto> {
    type CapsuleComments = {
      commentId: string;
      userId: string;
      commenter_email: string;
      commentText: string;
      createdAt: Date;
      updatedAt: Date;
    };
    await this.prisma.$executeRawUnsafe(`BEGIN;`);
    await this.prisma.$executeRawUnsafe(`CALL get_capsule_comments('${capsuleId}', 'commentcursor');`) ;

    const fetchedComments = await this.prisma.$queryRawUnsafe(`FETCH ALL FROM commentcursor;`) as CapsuleComments[];
    await this.prisma.$executeRawUnsafe(`COMMIT;`);
    return {
      statusCode: 200,
      message: 'Success',
      data: fetchedComments,
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

  async uploadAvatarCapsule(dto: UpdateAvatarCapsuleDto, file: File) {
    // Kiểm tra capsule tồn tại
    const capsule = await this.prisma.capsule.findUnique({
      where: { id: dto.capsuleId },
    });

    if (!capsule) {
      throw new BadRequestException('Capsule not found');
    }

    // Upload ảnh lên S3
    const params = {
      Bucket: 'testecho123',
      Key: `avatars/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await this.s3.upload(params).promise();
    const imageUrl = data.Location;

    // Cập nhật imageUrl trong bảng Capsule
    await this.prisma.capsule.update({
      where: { id: dto.capsuleId },
      data: { imageUrl }, 
    });

    return {
      message: 'Avatar uploaded successfully to capsule',
      capsuleId: dto.capsuleId,
      imageUrl,
    };
  }

  // Phương thức khác (như findCapsuleById) giữ nguyên nếu có
  async findCapsuleById(id: string) {
    return this.prisma.capsule.findUnique({
      where: { id },
    });
  }

  async uploadMediatoCapsule(dto: CreateCapsuleDto, file: File) {
  const params = {
    Bucket: 'testecho123',
    Key: `capsules/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await this.s3.upload(params).promise();
  const imageUrl = data.Location;

  // Tìm capsule đã tồn tại dựa trên capsuleId (giả sử dto chứa capsuleId)
  const capsule = await this.prisma.capsule.findUnique({
    where: { id: dto.capsuleId || dto.userId },
  });

  if (!capsule) {
    throw new BadRequestException('Capsule not found');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: dto.userId },
  });

  // Tạo bản ghi trong bảng CapsuleMedia để liên kết ảnh với capsule
  await this.prisma.capsuleMedia.create({
    data: {
      mediaId: crypto.randomUUID(),
      capsuleId: capsule.id,
      mediaUrl: imageUrl,
      mediaType: file.mimetype,
      uploadedBy: dto.userId,
      uploadedAt: new Date(),
      metadata: '{"resolution": "1920x1080"}',
    },
  });

  return {
    message: 'Image uploaded successfully to existing capsule',
    capsuleId: capsule.id,
    imageUrl: imageUrl,
  };
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
