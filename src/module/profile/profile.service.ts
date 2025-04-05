import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponseDto } from './dto/response.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

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
            avatar: true,
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