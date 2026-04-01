import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import { Strategy as JwtStrategyBase, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStrategy extends PassportStrategy(LocalStrategyBase) {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    return this.auth.validateUser(email, password);
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}