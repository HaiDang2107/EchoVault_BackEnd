import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { getYourViewCapsuleQuery } from "src/utils/capsuleQuery.util";
import { ApiResponseDto } from "./dto/response.dto";

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}
    
    async getCapsulesDashboard (userId: string, page: number, limit: number, statusFilter?: string): Promise<ApiResponseDto> {
        const capsules = await getYourViewCapsuleQuery(this.prisma, userId, page, limit, statusFilter);
        //Need the skp atribute as we load data eventually
    
        // Fetch active advertisements
        const advertisements = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM get_active_advertisements();
      `;
    
      // Inject ads after every X capsules
      const INSERT_AFTER = 2;
      const result: any[] = [];
      let adIndex = 0;
    
      
    
      if(capsules != null){
        capsules.forEach((capsule, index) => {
          result.push({ type: 'capsule', data: capsule });
      
          // After every X capsules, insert one ad
          if ((index + 1) % INSERT_AFTER === 0 && advertisements.length > 0) {
            const ad = advertisements[adIndex % advertisements.length]; // loop ads
            result.push({ type: 'ad', data: ad });
            adIndex++;
          }
        });
      }
      
    
        return {
          statusCode: 200,
          message: 'Success',
          data: result,
        } as ApiResponseDto;
      }
    }