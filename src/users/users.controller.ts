import {
  Controller,
  Post,
  Body,
  HttpCode,
  Patch,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.data.interface';
import { Roles } from 'src/iam/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { Auth } from 'src/iam/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { WinstonLogger } from '../../config/winston.logger';

@Auth(AuthType.Bearer)
@ApiBearerAuth('JWT-auth')
@Controller('users')
@Roles(Role.Admin)
export class UsersController {
  private readonly logger = new WinstonLogger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @HttpCode(201)
  create(
    @Body() createUserDto: CreateUserDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.logger.log(`Admin ${user.email} created user: ${createUserDto}`);
    return this.usersService.create(createUserDto);
  }

  @Patch(':userId/role/:roleId')
  @ApiOperation({ summary: 'Assign a role to a user by IDs in URL' })
  @ApiParam({ name: 'userId', description: 'User ID to update role' })
  @ApiParam({ name: 'roleId', description: 'Role ID to assign to user' })
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.logger.log(
      `Admin ${user.email} assigning role ID ${roleId} to user ID: ${userId}`,
    );
    return await this.usersService.assignRole(userId, roleId);
  }
}
