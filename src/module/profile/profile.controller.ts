import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { ApiResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateAvatarDto } from '../capsule/dto';
import { FileInterceptor } from 'node_modules/@nestjs/platform-express';

@ApiTags('Profile') // Group in Swagger UI
@ApiBearerAuth() // Enables "Authorize" button in Swagger
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  
  @Post('uploadAvatar')
  @ApiOperation({ summary: 'Upload an avatar for a user' })
  @ApiBody({ type: UpdateAvatarDto })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() file: File,
    @Body() body: UpdateAvatarDto,
  ) {
    if (!file) {
      throw new BadRequestException('No avatar file uploaded');
    }

    try {
      const result = await this.profileService.uploadAvatar(body, file);
      return result;
    } catch (error:any ) {
      console.error(error);
      throw new InternalServerErrorException('Error uploading profile avatar', error.message);
    }
  }

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiBody({ schema: { example: { receiverId: 'uuid-of-receiver' } } })
  async sendFriendRequest(
    @Request() req,
    @Body('receiverId') receiverId: string,
  ): Promise<ApiResponseDto> {
    const senderId = req.user.id;
    return await this.profileService.sendFriendRequest(senderId, receiverId);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get pending friend requests' })
  async getPendingFriendRequests(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.profileService.getPendingFriendRequests(userId);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiBody({ schema: { example: { senderId: 'uuid-of-sender' } } })
  async acceptFriendRequest(
    @Request() req,
    @Body('senderId') senderId: string,
  ): Promise<ApiResponseDto> {
    const receiverId = req.user.id;
    return await this.profileService.acceptFriendRequest(senderId, receiverId);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Reject a friend request' })
  @ApiBody({ schema: { example: { senderId: 'uuid-of-sender' } } })
  async rejectFriendRequest(
    @Request() req,
    @Body('senderId') senderId: string,
  ): Promise<ApiResponseDto> {
    const receiverId = req.user.id;
    return await this.profileService.rejectFriendRequest(senderId, receiverId);
  }

  @Get('capsules')
  @ApiOperation({ summary: 'Get user time capsules' })
  async getUserCapsules(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.profileService.getUserCapsules(userId);
  }

  @Get('friends')
  @ApiOperation({ summary: 'Get user friends' })
  async getUserFriends(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.profileService.getUserFriends(userId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.profileService.getNotifications(userId);
  }
}
