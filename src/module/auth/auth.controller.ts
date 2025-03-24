import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // điều hướng người dùng tới trang đăng nhập của Google
    // không cần viết thêm mã gì ở đây vì guard đã lo việc này.
  }

  @UseGuards(GoogleAuthGuard) // Xử lí authorization code
  @Get('google/redirect')
  async googleAuthCallback(@Request() req) { // req.user sẽ chứa thông tin trả về từ hàm validate
    const token = await this.authService.login(req.user as any);
    return token;
    // Ở đây bạn có thể redirect người dùng về frontend cùng với token
    // Ví dụ:
    // const frontendUrl = 'YOUR_FRONTEND_URL'; // Thay bằng URL frontend của bạn
    // return res.redirect(`${frontendUrl}?access_token=${token.access_token}`);
  }

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    // extract data from the body of a HTTP request
    console.log({
      dto,
    });
    return this.authService.signup(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    const token = this.authService.login(req.user);
    return token;
  }
}
