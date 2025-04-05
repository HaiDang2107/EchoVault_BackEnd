import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 1. Send a friend request
  @Post('request')
  async sendFriendRequest(
    @Request() req,
    @Body('receiverId') receiverId: string,
  ): Promise<ApiResponseDto> {
    const senderId = req.user.id;
    return await this.profileService.sendFriendRequest(senderId, receiverId);
  }

  // 2. Retrieve pending friend requests for a user
  @Get('requests')
  async getPendingFriendRequests(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.profileService.getPendingFriendRequests(userId);
  }

  // 3. Accept a friend request
  @Post('accept')
  async acceptFriendRequest(
    @Request() req,
    @Body('senderId') senderId: string,
  ): Promise<ApiResponseDto> {
    const receiverId = req.user.id;
    return await this.profileService.acceptFriendRequest(senderId, receiverId);
  }

  // 4. Reject a friend request
  @Post('reject')
  async rejectFriendRequest(
    @Request() req,
    @Body('senderId') senderId: string,
  ): Promise<ApiResponseDto> {
    const receiverId = req.user.id;
    return await this.profileService.rejectFriendRequest(senderId, receiverId);
  }

  @Get('capsules')
  async getUserCapsules(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract userId from the authenticated user's context
    return await this.profileService.getUserCapsules(userId);
  }

  // 7. Get all friends of a user
  @Get('friends')
  async getUserFriends(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract userId from the authenticated user's context
    return await this.profileService.getUserFriends(userId);
  }

  // 8. Get all notifications for a user
  @Get('notifications')
  async getNotifications(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract userId from the authenticated user's context
    return await this.profileService.getNotifications(userId);
  }
}