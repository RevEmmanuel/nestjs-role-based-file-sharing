import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { HashingService } from '../iam/hashing/hashing.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {}, // mock UserModel
        },
        {
          provide: getModelToken(Role.name),
          useValue: {}, // mock RoleModel
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn((password: string) => `hashed-${password}`),
            compare: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
