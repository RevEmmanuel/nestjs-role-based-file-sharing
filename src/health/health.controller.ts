import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Roles } from 'src/iam/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@Controller('health')
@Roles(Role.Admin, Role.Manager, Role.Employee)
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private mongoose: MongooseHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  checkCombines() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () => this.mongoose.pingCheck('mongo'),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('/http')
  @HealthCheck()
  checkHttp() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @Get('/db')
  @HealthCheck()
  checkDbHealth() {
    return this.health.check([() => this.mongoose.pingCheck('mongo')]);
  }

  @Get('/disk')
  @HealthCheck()
  checkDiskHealth() {
    return this.health.check([
      () =>
        this.disk.checkStorage('disk health', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }
}
