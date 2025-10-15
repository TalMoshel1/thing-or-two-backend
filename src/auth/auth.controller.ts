import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { Response, Request } from 'express';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto.email, dto.password);
    // set cookie with same token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: Number(process.env.JWT_EXPIRES) ? Number(process.env.JWT_EXPIRES) * 1000 : 24 * 60 * 60 * 1000,
    };
    res.cookie('jwt', result.access_token, cookieOptions);
    return result;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: Number(process.env.JWT_EXPIRES) ? Number(process.env.JWT_EXPIRES) * 1000 : 24 * 60 * 60 * 1000,
    };
    res.cookie('jwt', result.access_token, cookieOptions);
    return result;
  }

  @Get('validate')
  async validate(@Req() req: Request) {
    // protected by global JwtAuthGuard; req.user populated by JwtStrategy
    return req.user || null;
  }
}
