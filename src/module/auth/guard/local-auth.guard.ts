import { Injectable, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions'; 
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // Passport sẽ tự gán req.user
  }
}
