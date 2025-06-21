import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { WinstonLogger } from '../../../../config/winston.logger';

export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new WinstonLogger(RefreshTokenIdsStorage.name);
  private redisClient: Redis;

  onApplicationBootstrap() {
    this.logger.log('Connecting to Redis...');
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6380,
    });
    this.redisClient.on('connect', () => this.logger.log('Redis connected'));
    this.redisClient.on('error', (err) =>
      this.logger.error('Redis error', err.message),
    );
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down Redis connection due to signal: ${signal}`);
    await this.redisClient.quit();
    this.logger.log('Redis connection closed');
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    this.logger.debug(`Inserting refresh token for user ${userId}`);
    await this.redisClient.set(this.getKey(userId), tokenId);
    this.logger.debug(`Refresh token inserted for user ${userId}`);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    this.logger.debug(`Validating refresh token for user ${userId}`);
    const storedTokenId = await this.redisClient.get(this.getKey(userId));
    if (storedTokenId !== tokenId) {
      this.logger.warn(`Invalid refresh token for user ${userId}`);
      throw new Error('Invalid refresh token');
    }
    this.logger.debug(`Refresh token validated for user ${userId}`);
    return true;
  }

  async invalidate(userId: number): Promise<void> {
    this.logger.debug(`Invalidating refresh token for user ${userId}`);
    await this.redisClient.del(this.getKey(userId));
    this.logger.debug(`Refresh token invalidated for user ${userId}`);
  }

  private getKey(userId: number): string {
    return `user-${userId}`;
  }
}
