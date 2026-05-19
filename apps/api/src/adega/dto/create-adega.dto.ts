import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAdegaDto {
  @IsString()
  name: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  openingHours?: any;
}
