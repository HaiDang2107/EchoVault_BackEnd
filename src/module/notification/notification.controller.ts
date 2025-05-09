import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiResponseDto } from './dto/response.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest 10 unread notifications for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of notifications', type: ApiResponseDto })
  async getUserNotifications(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.notificationService.getUserNotifications(userId);
  }
}
