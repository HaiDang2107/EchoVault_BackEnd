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


import { getYourViewCapsuleQuery } from 'src/utils/capsuleQuery.util';

@Injectable()
export class GetCapsuleService {
  constructor(private readonly prisma: PrismaService) {}

    async getCanViewCapsule(userId: string, page: number, limit: number, statusFilter?: string): Promise<ApiResponseDto> {
      const capsules = await getYourViewCapsuleQuery(this.prisma, userId, page, limit, statusFilter);
      //Need the skp atribute as we load data eventually
      console.log("capsule",capsules);
    

      return {
        statusCode: 200,
        message: 'Success',
        data: capsules,
      } as ApiResponseDto;
    }

    async getCanBeOpenedCapsule(userId: string): Promise<ApiResponseDto> {
      const capsules = await getYourViewCapsuleQuery(this.prisma, userId, 1, 100, 'locked');
      const now = new Date();
      const filteredCapsules = capsules.filter(capsule => new Date(capsule.openingTime) <= now);
      console.log("filtered capsules that can be opened now:", filteredCapsules);

      return {
        statusCode: 200,
        message: 'Success',
        data: filteredCapsules,
      } as ApiResponseDto;
    }

    async getCapsuleInfo(capsuleId: string, userId: string): Promise<ApiResponseDto> {
      const capsule = await this.prisma.capsule.findUnique({
        where: {
          id: capsuleId,
        },
        include: {
          comments: true, // Include comments
          reactions: true, // Include reactions
          capsuleMedia: true, // Include media
          viewers: { // Include viewers of the capsule
            include: {
              user: true, // Include user details for each viewer
            },
          },
          recallQuestions: true, // Include recall questions
        },
      });
    
      if (!capsule) {
        throw new NotFoundException('Capsule not found');
      }
    
      return {
        statusCode: 200,
        message: 'Success',
        data: capsule,
      } as ApiResponseDto;
    }

    // async getMyCapsule(userId: string): Promise<ApiResponseDto> {
    //   const capsule = await this.prisma.capsule.findUnique({
    //     where: {
    //       userId,
    //       },
    //       include: {

    // }
  }
