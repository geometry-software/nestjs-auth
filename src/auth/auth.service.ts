import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.validate(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async issueToken(user: { id: string; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }

  async register(dto: RegisterDto) {
    const user = await this.users.create(dto);

    return this.issueToken({
      id: user.id,
      email: user.email,
    });
  }
}