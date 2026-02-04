import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private adminService: AdminService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing admin token');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.adminService.verifyAdminToken(token);

      // Check if user has admin role
      if (!payload.role || !['admin', 'support'].includes(payload.role)) {
        throw new UnauthorizedException('Admin role required');
      }

      // Attach user info to request
      request.user = {
        userId: payload.sub,
        suiAddress: payload.sui_address,
        role: payload.role,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid admin session');
    }
  }
}
