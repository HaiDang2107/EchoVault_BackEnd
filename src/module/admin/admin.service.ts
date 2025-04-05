import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/admin.dto';
import {
    Injectable,
  } from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { ApiResponseDto } from './dto/response.dto';


@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Create Advertisement
  async createAdvertisement(dto: CreateAdvertisementDto): Promise<ApiResponseDto> {
    const advertisement = await this.prisma.advertisement.create({
      data: {
        title: dto.title,
        mediaUrl: dto.mediaUrl,
        targetUrl: dto.targetUrl,
        displayOrder: dto.displayOrder ?? 0,
      },
    });

    return {
      statusCode: 201,
      message: 'Advertisement created successfully.',
      data: advertisement,
    } as ApiResponseDto;
  }

  // Update Advertisement
  async updateAdvertisement(id: string, dto: UpdateAdvertisementDto): Promise<ApiResponseDto> {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id },
    });

    if (!advertisement) {
        return {
            statusCode: 404,
            message: 'Advertisement not found'
          } as ApiResponseDto;    }

    const updatedAdvertisement = await this.prisma.advertisement.update({
      where: { id },
      data: {
        title: dto.title ?? advertisement.title,
        mediaUrl: dto.mediaUrl ?? advertisement.mediaUrl,
        targetUrl: dto.targetUrl ?? advertisement.targetUrl,
        displayOrder: dto.displayOrder ?? advertisement.displayOrder,
        isActive: dto.isActive ?? advertisement.isActive,
      },
    });

    return {
      statusCode: 200,
      message: 'Advertisement updated successfully.',
      data: updatedAdvertisement,
    } as ApiResponseDto;
  }
}