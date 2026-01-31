import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('zklogin')
  async zkLogin(@Body() body: any) {
    // TODO: Implement zkLogin authentication
    return this.authService.zkLogin(body);
  }
}
