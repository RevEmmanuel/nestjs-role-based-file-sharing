import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { HashingService } from 'src/iam/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly hashingService: HashingService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );

    // Get default role (e.g., guest)
    const defaultRole = await this.roleModel.findOne({ name: 'guest' });
    if (!defaultRole) {
      throw new Error('Default role "guest" not found');
    }

    // Create new user object
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: defaultRole._id,
    });

    // Save user
    return newUser.save();
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const user: User | null = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.role = role._id as Types.ObjectId;
    return user.save();
  }
}
