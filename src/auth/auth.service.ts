import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /** 🔒 Sets secure cookie for JWT */
  private setAuthCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
      httpOnly: true, // prevents access via JS
      secure: isProd, // HTTPS only in production
      sameSite: isProd ? 'strict' : 'lax', // needed for cross-port localhost dev
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/', // available across the app
    });
  }

  async validateUser(email: string, plainPass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(plainPass, user.password);
    if (!isMatch) return null;

    const { password, ...result } = user;
    return result;
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.setAuthCookie(res, token);
    return { message: 'Login successful', user: { id: user.id, email: user.email } };
  }

  async register(email: string, password: string, res: Response) {
    const user = await this.usersService.create(email, password);
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.setAuthCookie(res, token);
    return { message: 'Registration successful', user: { id: user.id, email: user.email } };
  }
}
