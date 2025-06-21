import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { HashingService } from 'src/iam/hashing/hashing.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(
      `Attempting to create user with email: ${createUserDto.email}`,
    );

    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      this.logger.warn(
        `User creation failed: email ${createUserDto.email} already exists`,
      );
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );
    this.logger.log(`Password hashed for email: ${createUserDto.email}`);

    const defaultRole = await this.roleModel.findOne({ name: 'guest' });
    if (!defaultRole) {
      this.logger.error('Default role "guest" not found while creating user');
      throw new Error('Default role "guest" not found');
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger.log(`Default role "guest" found: ${defaultRole._id}`);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: defaultRole._id,
    });

    const savedUser = await newUser.save();
    this.logger.log(`User created successfully with email: ${savedUser.email}`);

    return savedUser;
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    this.logger.log(`Assigning role ${roleId} to user ${userId}`);

    const role = await this.roleModel.findById(roleId);
    if (!role) {
      this.logger.warn(
        `Role assignment failed: Role with ID ${roleId} not found`,
      );
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const user: User | null = await this.userModel.findById(userId);
    if (!user) {
      this.logger.warn(
        `Role assignment failed: User with ID ${userId} not found`,
      );
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.role = role._id as Types.ObjectId;
    const updatedUser = await user.save();
    this.logger.log(
      `Role ${role.name} assigned to user ${user.email} successfully`,
    );

    return updatedUser;
  }
}
