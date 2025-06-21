import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from './hashing.service';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class BcryptService implements HashingService {
  private readonly logger = new Logger(BcryptService.name);

  async hash(data: string | Buffer): Promise<string> {
    this.logger.debug('Hashing data...');
    const salt = await genSalt();
    const hashed = await hash(data, salt);
    this.logger.debug('Hashing complete');
    return hashed;
  }

  async compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    this.logger.debug('Comparing data with hash...');
    const result = await compare(data, encrypted);
    this.logger.debug(`Comparison result: ${result}`);
    return result;
  }
}
