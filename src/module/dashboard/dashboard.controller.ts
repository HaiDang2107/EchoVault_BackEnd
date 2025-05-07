import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ApiResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('getCapsulesDashboard')
  @ApiOperation({ summary: 'Get capsules dashboard' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getCapsulesDashboard(
    @Request() req,
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Param('statusFilter') statusFilter?: string,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.dashboardService.getCapsulesDashboard(
      userId,
      page,
      limit,
      statusFilter,
    );
  }
}
