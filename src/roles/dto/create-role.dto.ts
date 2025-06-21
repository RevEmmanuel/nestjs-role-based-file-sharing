import { ArrayNotEmpty, IsEnum, IsNotEmpty } from 'class-validator';
import { Permission } from 'src/users/enums/permission.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;
  label?: string;
  @ArrayNotEmpty()
  @IsEnum(Permission, { each: true })
  @ApiProperty({
    description: 'List of permissions assigned to this role',
    enum: Permission,
    isArray: true,
    example: Object.values(Permission),
  })
  permissions: Permission[];
}
