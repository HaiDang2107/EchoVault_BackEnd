import { Controller, Post, Get, Body, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Response } from 'express';
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
  async signup(@Body() dto: AuthDto) {
    // extract data from the body of a HTTP request
    console.log({
      dto,
    });
    return this.authService.signup(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    const token = await this.authService.login(req.user);

    // Lưu JWT vào cookie
    res.cookie('jwt', token.access_token, {
      httpOnly: true,  
      sameSite: 'strict', // Ngăn gửi cookie trong yêu cầu cross-site
      maxAge: 3600000,  // Thời gian sống của cookie (1 giờ)
    });

    return res.status(200).json({ message: 'Log in successfully' });;
  }

  @Post('logout')
  async logout(@Res() res: Response) {

    res.clearCookie('jwt', { 
      httpOnly: true,  
      sameSite: 'strict',
    });
    
    return res.status(200).json({ message: 'Log out successfully' });
  }
}
