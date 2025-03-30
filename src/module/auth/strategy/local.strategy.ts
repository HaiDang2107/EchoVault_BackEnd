import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from "../../user/user.service"
import * as argon2 from 'argon2';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({ usernameField: 'email' }); // Sử dụng email thay vì username
  }

  async validate(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash)
      throw new UnauthorizedException('Logged in with Google');

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      return new UnauthorizedException('Wrong password');;
    }

    return user;
  }
}
