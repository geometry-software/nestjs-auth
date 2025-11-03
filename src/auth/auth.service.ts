import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.validate(email, pass);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async issueToken(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwt.signAsync(payload) };
  }

  async register(email: string, password: string) {
    const user = await this.users.create(email, password);
    return this.issueToken({ id: user.id, email: user.email });
  }
}
