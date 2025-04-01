import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ApiResponseDto } from './dto/response.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // 1. Send a friend request
  @Post('request')
  async sendFriendRequest(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
  ): Promise<ApiResponseDto> {
    return await this.friendsService.sendFriendRequest(senderId, receiverId);
  }

  // 2. Retrieve pending friend requests for a user
  @Get('requests/:userId')
  async getPendingFriendRequests(@Param('userId') userId: string): Promise<ApiResponseDto> {
    return await this.friendsService.getPendingFriendRequests(userId);
  }

  // 3. Accept a friend request
  @Post('accept')
  async acceptFriendRequest(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
  ): Promise<ApiResponseDto> {
    return await this.friendsService.acceptFriendRequest(senderId, receiverId);
  }

  // 4. Reject a friend request
  @Post('reject')
  async rejectFriendRequest(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
  ): Promise<ApiResponseDto> {
    return await this.friendsService.rejectFriendRequest(senderId, receiverId);
  }
}