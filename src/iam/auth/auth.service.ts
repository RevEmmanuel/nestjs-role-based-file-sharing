import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user.data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenIdsStorage } from '../storage/refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    this.logger.log(
      `Attempting to sign up user with email: ${signUpDto.email}`,
    );
    const check = await this.userModel.findOne({
      email: signUpDto.email,
    });
    if (check) {
      this.logger.warn(
        `Sign up failed: User already exists with email ${signUpDto.email}`,
      );
      throw new ConflictException('User already exists');
    }
    const defaultRole = await this.roleModel.findOne({ name: 'guest' });
    if (!defaultRole) {
      this.logger.error('Default role "guest" not found');
      throw new Error('Default role not found');
    }
    const user = { ...signUpDto, role: defaultRole._id };
    user.password = await this.hashingService.hash(user.password);
    this.logger.log(
      `User created successfully with email: ${signUpDto.email} and role: guest`,
    );
    return await this.userModel.create(user);
  }

  async signIn(signInDto: SignInDto) {
    this.logger.log(
      `Attempting to sign in user with email: ${signInDto.email}`,
    );
    const user = await this.userModel
      .findOne({
        email: signInDto.email,
      })
      .populate({ path: 'role', populate: { path: 'permissions' } });
    if (!user) {
      this.logger.warn(
        `Sign in failed: User not found with email ${signInDto.email}`,
      );
      throw new UnauthorizedException('Incorrect username or password');
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      this.logger.warn(
        `Sign in failed: Incorrect password for email ${signInDto.email}`,
      );
      throw new UnauthorizedException('Incorrect username or password!');
    }
    this.logger.log(`User signed in successfully: ${signInDto.email}`);
    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Refreshing tokens');
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userModel
        .findById({ _id: sub })
        .populate({ path: 'role', populate: { path: 'permissions' } })
        .exec();
      if (!user) {
        this.logger.warn(`Token refresh failed: User not found for ID ${sub}`);
        throw new UnauthorizedException('Invalid Token!');
      }

      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id as number,
        refreshTokenId,
      );

      if (!isValid) {
        this.logger.warn(
          `Token refresh failed: Invalid refresh token for user ID ${user.id}`,
        );
        throw new Error('Invalid refresh token');
      }
      await this.refreshTokenIdsStorage.invalidate(user.id as number);
      this.logger.log(`Tokens refreshed successfully for user ID ${user.id}`);
      return await this.generateTokens(user);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error refreshing tokens: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateTokens(user: User) {
    this.logger.log(`Generating tokens for user ID ${user.id}`);
    const refreshTokenId = randomUUID();

    // eslint-disable-next-line
    const role = user.role as any; // populated document
    // eslint-disable-next-line
    const permissions = (role.permissions || []).map((p: any) => p.name);

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id as number,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          // eslint-disable-next-line
          role: role.name,
          // eslint-disable-next-line
          permissions,
        },
      ),
      this.signToken(user.id as number, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    await this.refreshTokenIdsStorage.insert(user.id as number, refreshTokenId);
    this.logger.log(`Tokens generated for user ID ${user.id}`);
    return { accessToken, refreshToken };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    this.logger.log(`Signing token for user ID ${userId}`);
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
