import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Users who sign up are assigned the Guest role by default and can only view public files.',
  })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  @ApiOperation({
    summary: 'Authenticate user and obtain JWT tokens',
    description:
      'Returns access and refresh tokens upon successful authentication.',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('refresh-tokens')
  @ApiOperation({
    summary: 'Refresh JWT tokens',
    description:
      'Use a valid refresh token to obtain new access and refresh tokens.',
  })
  @ApiBearerAuth(process.env.SWAGGER_AUTH_NAME)
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
