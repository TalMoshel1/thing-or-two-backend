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

    return { message: 'Login successful', user: { id: user.id, email: user.email, token: token } };
  }

  async register(email: string, password: string, res: Response) {
    const user = await this.usersService.create(email, password);
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return { message: 'Registration successful', user: { id: user.id, email: user.email, token: token  } };
  }
}
