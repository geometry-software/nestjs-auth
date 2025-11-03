import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

class RegisterDto { email: string; password: string; }
class LoginDto { email: string; password: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Body() _dto: LoginDto, @Request() req: any) {
    const userId = String(req.user._id ?? req.user.id);
    return this.auth.issueToken({ id: +userId, email: req.user.email });
  }
}
