import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector dùng để đọc metadata
  constructor(private reflector: Reflector) {}

  // method này sẽ được gọi để kiểm tra role
  canActivate(context: ExecutionContext): boolean {
    // Trả về một mảng các Role yêu cầu cho route đó
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không có roles nào được yêu cầu thì ai cũng có thể truy cập
    if (!requiredRoles) return true;

    // Kiểm tra 2 roles có trùng nhau không
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
