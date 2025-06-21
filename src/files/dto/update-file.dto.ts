import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Updated file description' })
  description?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ example: ['finance', 'q3'], type: [String] })
  tags?: string[];
}
