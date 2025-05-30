import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiResponseDto } from './dto/response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('random-users')
  @ApiOperation({ summary: 'Get random friends' })
  async getRandomUsers(@Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract user ID from the JWT token
    const randomFriends = await this.userService.getListOfUsersRandomly(userId);
    return {
      statusCode: 200,
      message: 'Random friends retrieved successfully',
      data: randomFriends,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user information by JWT token' })
  async getUserByToken(@Request() req): Promise<ApiResponseDto> {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    const user = await this.userService.getUserByToken(token);
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Put('update')
  @ApiOperation({ summary: 'Update user info by user ID' })
  async updateUserByUserId(
    @Request() req,
    @Body() body: { passwordHash: string },
  ): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract user ID from the JWT token
    await this.userService.updateUserByUserId(userId, body.passwordHash);
    return {
      statusCode: 200,
      message: 'Password updated successfully',
    };
  }

  @Get('getUserByEmail:email')
  @ApiOperation({ summary: 'Get user information by email' })
  async getUserByEmail(@Request() req): Promise<ApiResponseDto> {
    const email = req.params.email; // Extract email from the request parameters
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
    };
  }
}