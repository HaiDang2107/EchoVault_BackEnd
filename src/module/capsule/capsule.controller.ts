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
async createCapsule(@Body() dto: Omit<NewCapsuleDto, 'userId'>, @Request() req): Promise<ApiResponseDto> {
  const userId = req.user.id; // Extract userId from the authenticated user's context
  return await this.capsuleService.createCapsule(dto, userId);
}

  @Delete('deleteCapsule:id')
  @HttpCode(HttpStatus.OK)
  async deleteCapsule(@Param('id') capsuleId: string, @Request() req): Promise<ApiResponseDto> {
    return await this.capsuleService.deleteCapsule(capsuleId);
  }


  @Post('giveComment')
  @HttpCode(HttpStatus.CREATED)
  async giveComment(
    @Body() dto: Omit<GiveCommentDto, 'userId'>,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract userId from the authenticated user's context
    return await this.capsuleService.giveComment(dto, userId);
  }

  @Post('giveReaction')
  @HttpCode(HttpStatus.CREATED)
  async giveReaction(
    @Body() dto: Omit<GiveReactionDto, 'userId'>,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id; // Extract userId from the authenticated user's context
    return await this.capsuleService.giveReaction(dto, userId);
}

@Get('allDashboard')
@HttpCode(HttpStatus.OK)
async getAllCapsulesDashboard(
  @Request() req,
  @Body('page') page: number,
  @Body('limit') limit: number,
): Promise<ApiResponseDto> {
  const userId = req.user.id;
  return await this.capsuleService.getAllCapsulesDashboard(userId, page, limit);
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

  // 3. Get viewers of a capsule
  @Get(':capsuleId/viewers')
  async getCapsuleViewers(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleViewers(capsuleId);
  }

  // 4. Get recall questions of a capsule
  @Get(':capsuleId/questions')
  async getCapsuleQuestions(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleQuestions(capsuleId);
  }

  // 5. Get all reactions of a capsule
  @Get(':capsuleId/reactions')
  async getCapsuleReactions(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleReactions(capsuleId);
  }

  // 6. Get all comments of a capsule
  @Get(':capsuleId/comments')
  async getCapsuleComments(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleComments(capsuleId);
  }

}