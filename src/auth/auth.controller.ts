import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto, LoginDto } from './dto';

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
    const userId = String(req.user?._id ?? req.user?.id);
    return this.auth.issueToken({ id: +userId, email: req.user.email });
  }
}
