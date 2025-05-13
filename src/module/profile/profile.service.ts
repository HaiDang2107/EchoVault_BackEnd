import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponseDto } from './dto/response.dto';
import { UpdateAvatarDto } from '../capsule/dto';
//import aws from 'aws-sdk';
import * as aws from 'aws-sdk';
import { File } from 'multer';

@Injectable()
export class ProfileService {
  private s3: aws.S3;

  constructor(private prisma: PrismaService) {
    this.prisma = prisma;
    this.s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  // 1. Send a friend request
  async sendFriendRequest(senderId: string, receiverId: string): Promise<ApiResponseDto> {
    // Check if a friend request already exists
    const existingRequest = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Friend request already exists.');
    }

    // Create a new friend request
    const friendRequest = await this.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    return {
      statusCode: 201,
      message: 'Friend request sent successfully.',
      data: friendRequest,
    } as ApiResponseDto;
  }

  // 2. Retrieve pending friend requests for a user
  async getPendingFriendRequests(userId: string): Promise<ApiResponseDto> {
    const pendingRequests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: 'Pending friend requests retrieved successfully.',
      data: pendingRequests,
    } as ApiResponseDto;
  }

  // 3. Accept a friend request
  async acceptFriendRequest(senderId: string, receiverId: string): Promise<ApiResponseDto> {
    // Check if the friend request exists and is pending
    console.log(senderId, receiverId); // Debugging line
    const friendRequest = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    

    if (!friendRequest || friendRequest.status !== 'PENDING') {
      throw new BadRequestException('Friend request not found or already processed.');
    }

    // Update the friend request status to ACCEPTED
    await this.prisma.friendRequest.update({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    // Add the friendship to the Friend table
    await this.prisma.friend.createMany({
      data: [
        { userId: senderId, friendId: receiverId },
      ],
    });

    return {
      statusCode: 200,
      message: 'Friend request accepted successfully.',
    } as ApiResponseDto;
  }

  // 4. Reject a friend request
  async rejectFriendRequest(senderId: string, receiverId: string): Promise<ApiResponseDto> {
    // Check if the friend request exists and is pending
    const friendRequest = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (!friendRequest || friendRequest.status !== 'PENDING') {
      throw new BadRequestException('Friend request not found or already processed.');
    }

    // Update the friend request status to REJECTED
    await this.prisma.friendRequest.update({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
      data: {
        status: 'REJECTED',
      },
    });

    return {
      statusCode: 200,
      message: 'Friend request rejected successfully.',
    } as ApiResponseDto;
  }

  async getUserCapsules(userId: string): Promise<ApiResponseDto> {
    const capsules = await this.prisma.$queryRaw`
      SELECT * FROM get_user_capsules(${userId}::uuid);
    `;
    return {
      statusCode: 200,  
      message: 'Success',
      data: capsules,
    } as ApiResponseDto;
  }

  async uploadAvatar(dto: UpdateAvatarDto, file: File) {
      // Kiểm tra user tồn tại
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
  
      if (!user) {
        throw new BadRequestException('User not found');
      }
  
      // Upload ảnh lên S3
      const params = {
        Bucket: 'testecho123',
        Key: `avatars/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
  
      const data = await this.s3.upload(params).promise();
      const avatarUrl = data.Location;
  
      // Cập nhật avatarUrl trong bảng User
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: { avatarUrl },
      });
  
      return {
        message: 'Avatar uploaded successfully',
        userId: dto.userId,
        avatarUrl,
      };
    }
  
    // Phương thức khác (như findUserByEmail) giữ nguyên
    async findUserByEmail(email: string) {
      return this.prisma.user.findUnique({
        where: { email },
      });
    }

  async getUserFriends(userId: string): Promise<ApiResponseDto> {
    const friends = await this.prisma.$queryRaw`
      SELECT * FROM get_user_friends(${userId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: friends,
    } as ApiResponseDto;
  }

  async getNotifications(userId: string): Promise<ApiResponseDto> {
    const notifications = await this.prisma.$queryRaw`
      SELECT * FROM get_notifications(${userId}::uuid);
    `;
    return {
      statusCode: 200,
      message: 'Success',
      data: notifications,
    } as ApiResponseDto;
  }
}