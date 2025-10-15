import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import type { Response, Request } from 'express';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // pass res directly to the service (service handles cookie)
    return this.auth.register(dto.email, dto.password, res);
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // pass res directly to the service (service handles cookie)
    return this.auth.login(dto.email, dto.password, res);
  }

  @Get('validate')
  async validate(@Req() req: Request) {
    // protected by JwtAuthGuard — req.user populated by JwtStrategy
    return req.user || null;
  }
}
