import { Controller, Post, Delete, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { CapsuleService,  } from './capsule.service';
import { NewCapsuleDto, GiveCommentDto, GiveReactionDto } from './dto/capsule.dto';
import { OpenedCapsuleInfoResponseDto, ApiResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { OpenCapsuleService } from './open-capsule.service';
import { SubmitAnswerDto } from './dto';

@Controller('capsules')
@UseGuards(JwtAuthGuard)
export class CapsuleController {
  constructor(
    private readonly capsuleService: CapsuleService,
    private readonly openCapsuleService: OpenCapsuleService,
  ) {}

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


  @Post('giveComment')
  @HttpCode(HttpStatus.CREATED)
  async giveComment(
    @Body() dto: GiveCommentDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    // Attach the userId from the authenticated user
    const userId = req.user.id;
    return await this.capsuleService.giveComment({ ...dto, userId });
  }

  @Post('giveReaction')
  @HttpCode(HttpStatus.CREATED)
  async giveReaction(
    @Body() dto: GiveReactionDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    // Attach the userId from the authenticated user
    const userId = req.user.id;
    return await this.capsuleService.giveReaction({ ...dto, userId });
  }


  @Post(':capsuleId/open-request')
  @HttpCode(HttpStatus.OK)
  async requestOpenCapsule(
    @Param('capsuleId') capsuleId: string,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.openCapsuleService.requestOpenCapsule(capsuleId, userId);
  }

  @Get(':capsuleId/description')
  @HttpCode(HttpStatus.OK)
  async getDescription(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getDescription(capsuleId);
  }

  @Get(':capsuleId/questions')
  @HttpCode(HttpStatus.OK)
  async getQuestions(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getQuestions(capsuleId);
  }

  @Post(':capsuleId/questions/:questionId/answer')
  @HttpCode(HttpStatus.OK)
  async submitAnswer(
    @Param('questionId') questionId: string,
    @Body() dto: SubmitAnswerDto,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.submitAnswer(dto);
  }

  @Get(':capsuleId/questions/:questionId/explain')
  @HttpCode(HttpStatus.OK)
  async getExplanation(
    @Param('questionId') questionId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getExplanation(questionId);
  }

  @Get(':capsuleId/content')
  @HttpCode(HttpStatus.OK)
  async getContent(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getOpenedCapsuleById(capsuleId);
  }

  @Post(':capsuleId/abort')
  @HttpCode(HttpStatus.OK)
  async abortOpenCapsule(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.abortOpenCapsule(capsuleId);
  }
}