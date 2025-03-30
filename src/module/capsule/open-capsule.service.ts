import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { ApiResponseDto, OpenedCapsuleInfoResponseDto } from './dto/response.dto';
import { SubmitAnswerDto } from './dto';
import { CapsuleNotFoundException, CapsuleNotOpenedException } from './exceptions/capsule.exception';

@Injectable()
export class OpenCapsuleService {
  constructor(private prisma: PrismaService) {}

  async requestOpenCapsule(capsuleId: string, userId: string): Promise<ApiResponseDto> {
    // Find the capsule by ID
    const capsule = await this.prisma.capsule.findUnique({
      where: { id: capsuleId },
    });

    if (!capsule) {
      throw new CapsuleNotFoundException();
    }

    // Check if the capsule has reached its opening time
    const currentTime = new Date();
    if (currentTime < capsule.openingTime) {
      throw new CapsuleNotOpenedException();
    }

    // Update the capsule status to "Opened"
    await this.prisma.capsule.update({
      where: { id: capsuleId },
      data: { status: 'Opened' },
    });

    return {
      statusCode: 200,
      message: 'Capsule opened successfully',
    } as ApiResponseDto;
  }

  async getDescription(capsuleId: string): Promise<ApiResponseDto> {
    const capsule = await this.prisma.capsule.findUnique({
      where: { id: capsuleId },
      select: { description: true },
    });

    if (!capsule) {
      throw new CapsuleNotFoundException();
    }

    return {
      statusCode: 200,
      message: 'Capsule description retrieved successfully',
      data: capsule.description,
    } as ApiResponseDto;
  }

  async getQuestions(capsuleId: string): Promise<ApiResponseDto> {
    const questions = await this.prisma.recallQuestion.findMany({
      where: { capsuleId },
      select: {
        id: true,
        question: true,
        choicesA: true,
        choicesB: true,
        choicesC: true,
        choicesD: true,
      },
    });

    if (!questions.length) {
      throw new CapsuleNotFoundException();
    }

    return {
      statusCode: 200,
      message: 'Recall questions retrieved successfully',
      data: questions,
    } as ApiResponseDto;
  }

  async submitAnswer(
    dto: SubmitAnswerDto,
  ): Promise<ApiResponseDto> {
    // Fetch the specific question by ID
    const question = await this.prisma.recallQuestion.findUnique({
      where: { id: dto.questionId },
      select: {
        correctAnswer: true,
      },
    });
  
    if (!question) {
      throw new CapsuleNotFoundException(); // Question not found
    }
  
    // Check if the user's answer is correct
    const isCorrect = question.correctAnswer === dto.answer;
  
    return {
      statusCode: 200,
      message: 'Answer submitted successfully',
      data: { correct: isCorrect },
    } as ApiResponseDto;
  }

  async getExplanation(questionId: string): Promise<ApiResponseDto> {
    // Fetch the specific question by ID
    const question = await this.prisma.recallQuestion.findUnique({
      where: { id: questionId },
      select: {
        correctAnswer: true,
        explaination: true,
      },
    });
  
    if (!question) {
      throw new CapsuleNotFoundException(); // Question not found
    }
  
    return {
      statusCode: 200,
      message: 'Explanation retrieved successfully',
      data: {
        correctAnswer: question.correctAnswer,
        explaination: question.explaination,
      },
    } as ApiResponseDto;
  }

  async getOpenedCapsuleById(
      capsuleId: string,
    ): Promise<OpenedCapsuleInfoResponseDto> {
      const capsule = await this.prisma.capsule.findUnique({
        where: { id: capsuleId },
        include: {
          contributors: true,
          viewers: true,
          recallQuestions: true,
        },
      });
  
      if (!capsule) {
        throw new CapsuleNotFoundException();
      }
  
      if (capsule.status !== 'Opened') {
        throw new CapsuleNotOpenedException();
      }
  
      return {
        statusCode: 200,
        message: 'Success',
        openedCapsule: {
          id: capsule.id,
          userId: capsule.userId,
          content: capsule.content,
          theme: capsule.theme,
          description: capsule.description,
          notificationInterval: capsule.notificationInterval,
          openingTime: capsule.openingTime,
          status: capsule.status,
          contributors: capsule.contributors.map(
            (contributor) => contributor.userId,
          ),
          viewers: capsule.viewers.map((viewer) => viewer.userId),
          recallQuestions: capsule.recallQuestions,
        },
      } as OpenedCapsuleInfoResponseDto;
    }

  async abortOpenCapsule(capsuleId: string): Promise<ApiResponseDto> {
    // Logic to discard actions (if any)
    const capsule = await this.prisma.capsule.findUnique({
        where: { id: capsuleId },
      });
  
      if (!capsule) {
        throw new CapsuleNotFoundException();
      }
  
  
      // Update the capsule status to "Locked"
      await this.prisma.capsule.update({
        where: { id: capsuleId },
        data: { status: 'Locked' },
      });

    return {
      statusCode: 200,
      message: 'Capsule opening aborted successfully',
    } as ApiResponseDto;
  }
}