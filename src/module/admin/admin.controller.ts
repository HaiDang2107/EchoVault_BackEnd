import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/admin.dto';
import { ApiResponseDto } from './dto/response.dto';
import { AdminService } from './admin.service';

@Controller('admin/advertisements')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * @route POST /admin/advertisements
   * @desc Create a new advertisement
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAdvertisement(
    @Body() dto: CreateAdvertisementDto,
  ): Promise<ApiResponseDto> {
    return await this.adminService.createAdvertisement(dto);
  }

  /**
   * @route PUT /admin/advertisements/:id
   * @desc Update an existing advertisement
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAdvertisement(
    @Param('id') id: string,
    @Body() dto: UpdateAdvertisementDto,
  ): Promise<ApiResponseDto> {
    return await this.adminService.updateAdvertisement(id, dto);
  }
}
