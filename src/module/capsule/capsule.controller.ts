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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { CapsuleService } from './capsule.service';
import {
  NewCapsuleDto,
  GiveCommentDto,
  GiveReactionDto,
  NewRecallQuestionDto,
  DeleteCapsuleDto,
  CreateCapsuleDto,
  UpdateAvatarDto,
  UpdateAvatarCapsuleDto,
} from './dto/capsule.dto';
import {
  OpenedCapsuleInfoResponseDto,
  ApiResponseDto,
} from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { OpenCapsuleService } from './open-capsule.service';
import { SubmitAnswerDto } from './dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { File } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCapsuleService } from './get-capsule.service';

@ApiTags('Capsules')
@Controller('capsules')
@UseGuards(JwtAuthGuard)
export class CapsuleController {
  constructor(
    private readonly capsuleService: CapsuleService,
    private readonly getCapsuleService: GetCapsuleService,
    private readonly openCapsuleService: OpenCapsuleService,
  ) {}

  @Post('uploadAvatar')
  @ApiOperation({ summary: 'Upload an avatar for a capsule' })
  @ApiBody({ type: UpdateAvatarCapsuleDto })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadCapsuleAvatar(
    @UploadedFile() file: File,
    @Body() body: UpdateAvatarCapsuleDto,
  ) {
    if (!file) {
      throw new BadRequestException('No avatar file uploaded');
    }

    try {
      const result = await this.capsuleService.uploadAvatarCapsule(body, file);
      return result;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Error uploading capsule avatar',
          error.message,
        );
      } else {
        throw new InternalServerErrorException(
          'Error uploading capsule avatar',
          'Unknown error occurred',
        );
      }
    }
  }

  @Post('uploadMedia')
  @ApiOperation({ summary: 'Upload an image' })
  @ApiBody({ type: CreateCapsuleDto })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('image')) // Handle file upload with key 'image'
  async uploadCapsuleImage(
    @UploadedFile() file: File,
    @Body() body: CreateCapsuleDto,
  ) {
    if (!file) {
      return { status: 400, json: { message: 'No image file uploaded' } };
    }

    try {
      const result = await this.capsuleService.uploadMediatoCapsule(body, file);
      return { status: 201, json: result };
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 500,
        json: {
          message: 'Error uploading image or creating capsule',
          error: errorMessage,
        },
      };
    }
  }

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

  @Delete('deleteCapsule')
  @ApiOperation({ summary: 'Delete a capsule' })
  @ApiBody({ type: DeleteCapsuleDto })
  @ApiResponse({ status: 200, description: 'Capsule deleted successfully' })
  async deleteCapsule(@Body() dto: DeleteCapsuleDto): Promise<ApiResponseDto> {
    return this.capsuleService.deleteCapsule(dto);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Get capsule details' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Capsule details retrieved successfully' })
  async getCapsuleInfo(
    @Request() req,
    @Param('id') id: string,
  ) : Promise<ApiResponseDto> {
    const userId = req.user.id
    return this.getCapsuleService.getCapsuleInfo(id, userId);
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

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get user dashboard capsules with pagination and filter',
  })
  @ApiResponse({ status: 200, description: 'Dashboard data fetched' })
  @ApiQuery({ name: 'page', required: true, description: 'The page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: true, description: 'The number of items per page', example: 10 })
  @ApiQuery({ name: 'statusFilter', required: false, description: 'Filter capsules by status (e.g., "Locked", "Opened")', example: 'Locked' })
  async getCapsulesDashboard(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('statusFilter') statusFilter?: string,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;
    console.log(
      `getCapsulesDashboard - userId: ${userId}, page: ${page}, limit: ${limit}, statusFilter: ${statusFilter}`,
    );
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
  async getDescription(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getDescription(capsuleId);
  }

  @Get(':capsuleId/questions')
  @ApiOperation({ summary: 'Get all questions of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getQuestions(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
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
  async getExplanation(
    @Param('questionId') questionId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getExplanation(questionId);
  }

  @Get(':capsuleId/content')
  @ApiOperation({ summary: 'Get the content of an opened capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getContent(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.getOpenedCapsuleById(capsuleId);
  }

  @Post(':capsuleId/abort')
  @ApiOperation({ summary: 'Abort opening a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async abortOpenCapsule(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.openCapsuleService.abortOpenCapsule(capsuleId);
  }

  @Get(':capsuleId/viewers')
  @ApiOperation({ summary: 'Get viewers of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleViewers(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleViewers(capsuleId);
  }

  @Get(':capsuleId/questions')
  @ApiOperation({ summary: 'Get recall questions of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleQuestions(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleQuestions(capsuleId);
  }

  @Get(':capsuleId/reactions')
  @ApiOperation({ summary: 'Get reactions of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleReactions(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleReactions(capsuleId);
  }

  @Get(':capsuleId/comments')
  @ApiOperation({ summary: 'Get comments of a capsule' })
  @ApiParam({ name: 'capsuleId', required: true })
  async getCapsuleComments(
    @Param('capsuleId') capsuleId: string,
  ): Promise<ApiResponseDto> {
    return await this.capsuleService.getCapsuleComments(capsuleId);
  }

  @Post('createRecallQuestion')
  async createRecallQuestion(
    @Body() dto: NewRecallQuestionDto,
  ): Promise<ApiResponseDto> {
    const recallQuestion = await this.capsuleService.createRecallQuestion(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Recall question created successfully',
      data: recallQuestion,
    };
  }

  @Get('my-capsules')
  @ApiOperation({ summary: 'Get all capsules created by the user' })
  @ApiResponse({ status: 200, description: 'My capsules retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'statusFilter', required: false, description: 'Filter capsules by status (e.g., "Locked", "Opened")', example: 'Locked' })
  async getMyCapsules(
    @Request() req,
    @Query('page') page: number = 1, // Default to page 1 if not provided
    @Query('limit') limit: number = 10, // Default to 10 items per page if not provided
    @Query('statusFilter') statusFilter?: string,
  ): Promise<ApiResponseDto> {
    const userId = req.user.id;

    // Call the service to fetch capsules
    return await this.getCapsuleService.getMyCapsules(userId, page, limit, statusFilter);
  }
}


