import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiResponseDto } from './dto/response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get user info' })
  @Get('profile')
  async getProfile(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id; // Assuming JWT payload has 'id' as user ID
    if (!userId) {
      return {
        statusCode: 401,
        message: 'Unauthorized',
      };
    }
    const user = await this.userService.getUserById(userId);
    return {
      statusCode: 200,
      message: 'Get user success',
      data: user,
    };
  }
}
