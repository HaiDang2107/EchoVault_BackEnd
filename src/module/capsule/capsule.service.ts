import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/module/prisma/prisma.service";
import { NewCapsuleDto, NewRecallQuestionDto } from "./dto/capsule.dto";
import { OpenedCapsuleInfoResponseDto, LockedCapsuleInfoResponseDto, ApiResponseDto } from "./dto/response.dto";
import { CapsuleNotFoundException, CapsuleNotOpenedException } from "./exceptions/capsule.exception";


@Injectable()
export class CapsuleService{
    constructor(private prisma: PrismaService){}
    
    async createCapsule(dto: NewCapsuleDto): Promise<ApiResponseDto> {
        const capsule = await this.prisma.capsule.create({
            data: {
                userId: dto.userId,
                content: dto.content,
                imageUrls: JSON.stringify(dto.imageUrls),
                theme: dto.theme ?? "",
                description: dto.description,
                notificationInterval: dto.notificationInterval,
                openingTime: dto.openingTime,
                createdAt: new Date(),
                status: 'Locked', // Default status
            },
        });

        // Create contributors
        if (dto.contributors && dto.contributors.length > 0) {
            await this.prisma.capsuleContributor.createMany({
                data: dto.contributors.map(userId => ({
                    capsuleId: capsule.id,
                    userId,
                })),
            });
        }
        //The front-end must include the author Id into the contributors as well as the viewers

        // Create viewers
        if (dto.viewers && dto.viewers.length > 0) {
            await this.prisma.capsuleViewer.createMany({
                data: dto.viewers.map(userId => ({
                    capsuleId: capsule.id,
                    userId,
                })),
            });
        }

        // Create recall questions
        if (dto.recallQuestions && dto.recallQuestions.length > 0) {
            for (const questionDto of dto.recallQuestions) {
                await this.createRecallQuestion({
                    ...questionDto,
                    capsuleId: capsule.id,
                });
            }
        }

        return {statusCode: 200, message: "Success"} as ApiResponseDto;
    }


    async createRecallQuestion(dto: NewRecallQuestionDto) {
        return await this.prisma.recallQuestion.create({
            data: {
                capsuleId: dto.capsuleId,
                question: dto.question,
                choicesA: dto.choicesA,
                choicesB: dto.choicesB,
                choicesC: dto.choicesC,
                choicesD: dto.choicesD,
                correctAnswer: dto.correctAnswer,
                explaination: dto.explaination ?? "",
            },
        });
    }

    async deleteCapsule(capsuleId: string, userId: string): Promise<ApiResponseDto> {
        // Check if the capsule exists and its status is "Opened"
        const capsule = await this.prisma.capsule.findUnique({
            where: { id: capsuleId },
        });

        if (!capsule) {
            throw new CapsuleNotFoundException();
        }

        if (capsule.status !== 'Opened') {
            throw new CapsuleNotOpenedException();
        }

        // Delete the capsule
        await this.prisma.capsule.delete({
            where: { id: capsuleId },
        });

        return {statusCode: 200, message: 'Success' };
    }

    async getOpenedCapsuleById(capsuleId: string, userId: string): Promise<OpenedCapsuleInfoResponseDto> {
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
                imageUrls: capsule.imageUrls,
                theme: capsule.theme,
                description: capsule.description,
                notificationInterval: capsule.notificationInterval,
                openingTime: capsule.openingTime,
                status: capsule.status,
                contributors: capsule.contributors.map(contributor => contributor.userId),
                viewers: capsule.viewers.map(viewer => viewer.userId),
                recallQuestions: capsule.recallQuestions,
            },
        } as OpenedCapsuleInfoResponseDto;
    }

    async getLockedCapsuleById(capsuleId: string, userId: string): Promise<LockedCapsuleInfoResponseDto> {
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

        return {
            statusCode: 200,
            message: 'Success',
            lockedCapsule:{
                id: capsule.id,
                userId: capsule.userId,
                theme: capsule.theme,
                description: capsule.description,
                notificationInterval: capsule.notificationInterval,
                openingTime: capsule.openingTime,
                status: capsule.status,
                contributors: capsule.contributors.map(contributor => contributor.userId),
                viewers: capsule.viewers.map(viewer => viewer.userId),
            }
            
        } as LockedCapsuleInfoResponseDto;
    }
}