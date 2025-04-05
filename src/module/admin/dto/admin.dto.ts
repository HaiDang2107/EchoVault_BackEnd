import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDate, IsInt, IsUrl, IsBoolean, Max, Min } from 'class-validator';


export class CreateAdvertisementDto {
    @IsString()
    title!: string; // Title of the advertisement
  
    @IsUrl()
    mediaUrl!: string; // Media URL for the advertisement
  
    @IsOptional()
    @IsUrl()
    targetUrl?: string; // Optional target URL for the advertisement
  
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number; // Optional display order (default is 0)
  }
  
export class UpdateAdvertisementDto {
    @IsOptional()
    @IsString()
    title?: string; // Optional title for the advertisement
  
    @IsOptional()
    @IsUrl()
    mediaUrl?: string; // Optional media URL for the advertisement
  
    @IsOptional()
    @IsUrl()
    targetUrl?: string; // Optional target URL for the advertisement
  
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number; // Optional display order
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean; // Optional flag to activate or deactivate the advertisement
  }

  