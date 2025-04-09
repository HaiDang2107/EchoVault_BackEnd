// capsule-media.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class CapsuleMediaService {
  constructor(private prisma: PrismaService) {}

  async getMediaByCapsuleId(capsuleId: string, userId: string) {
    // Truy xuất media từ CapsuleMedia
    const capsuleMedia = await this.prisma.capsuleMedia.findMany({
      where: { capsuleId },
      include: {
        capsule: {
          select: {
            privacy: true,
            userId: true,
          },
        }, // Bao gồm thông tin Capsule để kiểm tra quyền truy cập
      },
    });

    // Kiểm tra quyền truy cập
    for (const media of capsuleMedia) {
      if (media.capsule.privacy === 'Private' && media.capsule.userId !== userId) {
        throw new Error('You do not have permission to view this capsule');
      }
    }

    // Trả về mediaUrl và mediaType
    return capsuleMedia.map((media) => ({
      mediaUrl: media.mediaUrl, // URL trực tiếp từ S3
      mediaType: media.mediaType,
      metadata: media.metadata,
    }));
  }
}