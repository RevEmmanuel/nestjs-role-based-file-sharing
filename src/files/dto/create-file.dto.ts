import { IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true, always: false })
  tags?: string[];
}
