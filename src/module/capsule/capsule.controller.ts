import { Controller, Post, Delete, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { CapsuleService } from './capsule.service';
import { NewCapsuleDto } from './dto/capsule.dto';
import { OpenedCapsuleInfoResponseDto, ApiResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('capsules')
@UseGuards(JwtAuthGuard)
export class CapsuleController {
  constructor(private readonly capsuleService: CapsuleService) {}

  @Post('createCapsule')
  @HttpCode(HttpStatus.CREATED)
  async createCapsule(@Body() dto: NewCapsuleDto, @Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.createCapsule({ ...dto, userId });
  }

  @Delete('deleteCapsule:id')
  @HttpCode(HttpStatus.OK)
  async deleteCapsule(@Param('id') capsuleId: string, @Request() req): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.deleteCapsule(capsuleId, userId);
  }

  @Get('getOpenedCapsule:id')
  @HttpCode(HttpStatus.OK)
  async getCapsule(@Param('id') capsuleId: string, @Request() req): Promise<OpenedCapsuleInfoResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.getOpenedCapsuleById(capsuleId, userId);
  }
}