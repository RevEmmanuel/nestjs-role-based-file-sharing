import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from 'src/roles/roles.service';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: {}, // or use a mocked class/object
        },
        {
          provide: getModelToken(Permission.name),
          useValue: {}, // or use a mocked class/object
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
