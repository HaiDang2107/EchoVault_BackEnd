// capsule-media.controller.ts
import { Controller, Get, Param, Req } from '@nestjs/common';
import { CapsuleMediaService } from './capsule-media.service';

@Controller('capsule-media')
export class CapsuleMediaController {
  constructor(private readonly capsuleMediaService: CapsuleMediaService) {}

  @Get(':capsuleId')
  async getMediaByCapsuleId(
    @Param('capsuleId') capsuleId: string,
    @Req() req: any, // Giả sử bạn có middleware để lấy userId từ token
  ) {
    const userId = req.user.id; // Lấy userId từ token (cần triển khai xác thực)
    return this.capsuleMediaService.getMediaByCapsuleId(capsuleId, userId);
  }
}