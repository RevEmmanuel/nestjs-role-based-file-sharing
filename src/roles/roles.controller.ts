import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Auth } from 'src/iam/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { Roles } from 'src/iam/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@Auth(AuthType.Bearer)
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@Roles(Role.Admin, Role.Manager)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles with their permissions' })
  async getAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all available permissions' })
  async getPermissions() {
    return this.rolesService.findPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.findRoleById(id);
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  async getPermissionById(@Param('id') id: string) {
    return this.rolesService.findPermissionById(id);
  }
}
