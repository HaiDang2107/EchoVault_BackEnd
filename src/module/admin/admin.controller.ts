import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/admin.dto';
import { Controller, Post, Put, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiResponseDto } from './dto/response.dto';
import { AdminService } from './admin.service';

@Controller('advertisements')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Create Advertisement
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createAdvertisement(
    @Body() dto: CreateAdvertisementDto,
  ): Promise<ApiResponseDto> {
    return await this.adminService.createAdvertisement(dto);
  }

  // Update Advertisement
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async updateAdvertisement(
    @Param('id') id: string,
    @Body() dto: UpdateAdvertisementDto,
  ): Promise<ApiResponseDto> {
    return await this.adminService.updateAdvertisement(id, dto);
  }
}