import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class IsSuperAdminGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.user.role === 'Super Admin') {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
