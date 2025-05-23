import { Injectable, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions'; 
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials at guards no user');
    }
    if (err) {
      throw err || new UnauthorizedException('Invalid credentials at guards err');
    }
    return user; // Passport sẽ tự gán req.user
  }
}
