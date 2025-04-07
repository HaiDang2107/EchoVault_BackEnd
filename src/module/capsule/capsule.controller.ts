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
import { CapsuleService } from './capsule.service';
import {
  NewCapsuleDto,
  GiveCommentDto,
  GiveReactionDto,
} from './dto/capsule.dto';
import {
  OpenedCapsuleInfoResponseDto,
  ApiResponseDto,
} from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { OpenCapsuleService } from './open-capsule.service';
import { SubmitAnswerDto } from './dto';



@ApiTags('Capsules')
@Controller('capsules')
@UseGuards(JwtAuthGuard)
export class CapsuleController {
  constructor(
    private readonly capsuleService: CapsuleService,
    private readonly openCapsuleService: OpenCapsuleService,
  ) {}

  @Post('createCapsule')
  @ApiOperation({ summary: 'Create a new capsule' })
  @ApiBody({ type: NewCapsuleDto })
  @ApiResponse({ status: 201, description: 'Capsule created successfully' })
  async createCapsule(
    @Body() dto: Omit<NewCapsuleDto, 'userId'>,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.createCapsule(dto, userId);
  }

  @Delete('deleteCapsule:id')
  @ApiOperation({ summary: 'Delete a capsule by ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Capsule deleted successfully' })
  async deleteCapsule(@Param('id') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.deleteCapsule(capsuleId);
  }

  @Post('giveComment')
  @ApiOperation({ summary: 'Submit a comment to a capsule' })
  @ApiBody({ type: GiveCommentDto })
  @ApiResponse({ status: 201, description: 'Comment submitted successfully' })
  async giveComment(
    @Body() dto: Omit<GiveCommentDto, 'userId'>,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.giveComment(dto, userId);
  }

  @Post('giveReaction')
  @ApiOperation({ summary: 'Submit a reaction to a capsule' })
  @ApiBody({ type: GiveReactionDto })
  @ApiResponse({ status: 201, description: 'Reaction submitted successfully' })
  async giveReaction(
    @Body() dto: Omit<GiveReactionDto, 'userId'>,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.giveReaction(dto, userId);
  }

  @Post('dashboard')
  @ApiOperation({ summary: 'Get user dashboard capsules with pagination and filter' })
  @ApiResponse({ status: 200, description: 'Dashboard data fetched' })
  async getCapsulesDashboard(
    @Request() req,
    @Body('page') page: number,
    @Body('limit') limit: number,
    @Body('statusFilter') statusFilter?: string,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.capsuleService.getCapsulesDashboard(
      userId,
      page,
      limit,
      statusFilter,
    );
  }

  @Post(':capsuleId/open-request')
  @ApiOperation({ summary: 'Request to open a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async requestOpenCapsule(
    @Param('capsuleId') capsuleId: string,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    return await this.openCapsuleService.requestOpenCapsule(capsuleId, userId);
  }

  @Get(':capsuleId/description')
  @ApiOperation({ summary: 'Get description of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getDescription(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getDescription(capsuleId);
  }

  @Get(':capsuleId/questions')
  @ApiOperation({ summary: 'Get all questions of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getQuestions(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getQuestions(capsuleId);
  }

  @Post(':capsuleId/questions/:questionId/answer')
  @ApiOperation({ summary: 'Submit answer for a question in a capsule' })
  @ApiParam({ name: 'questionId', required: true })
  @ApiBody({ type: SubmitAnswerDto })
  async submitAnswer(
    @Param('questionId') questionId: string,
    @Body() dto: SubmitAnswerDto,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.submitAnswer(dto);
  }

  @Get(':capsuleId/questions/:questionId/explain')
  @ApiOperation({ summary: 'Get explanation for a specific question' })
  @ApiParam({ name: 'questionId', required: true })
  async getExplanation(@Param('questionId') questionId: string): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getExplanation(questionId);
  }

  @Get(':capsuleId/content')
  @ApiOperation({ summary: 'Get the content of an opened capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getContent(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getOpenedCapsuleById(capsuleId);
  }

  @Post(':capsuleId/abort')
  @ApiOperation({ summary: 'Abort opening a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async abortOpenCapsule(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.openCapsuleService.abortOpenCapsule(capsuleId);
  }

  @Get(':capsuleId/viewers')
  @ApiOperation({ summary: 'Get viewers of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleViewers(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleViewers(capsuleId);
  }

  @Get(':capsuleId/questions')
  @ApiOperation({ summary: 'Get recall questions of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleQuestions(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleQuestions(capsuleId);
  }

  @Get(':capsuleId/reactions')
  @ApiOperation({ summary: 'Get reactions of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleReactions(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleReactions(capsuleId);
  }

  @Get(':capsuleId/comments')
  @ApiOperation({ summary: 'Get comments of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleComments(@Param('capsuleId') capsuleId: string): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleComments(capsuleId);
  }
}
