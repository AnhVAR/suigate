import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser() {
    // TODO: Implement get current user profile
    return this.usersService.getCurrentUser();
  }

  @Patch('me/kyc')
  async updateKyc(@Body() body: any) {
    // TODO: Implement KYC update
    return this.usersService.updateKyc(body);
  }

  @Patch('me/location')
  async updateLocation(@Body() body: any) {
    // TODO: Implement location update
    return this.usersService.updateLocation(body);
  }
}
