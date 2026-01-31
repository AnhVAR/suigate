import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UpdateKycDto,
  UpdateLocationDto,
  UserProfileDto,
} from './dto/user-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req): Promise<UserProfileDto> {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me/kyc')
  async updateKyc(
    @Request() req,
    @Body() dto: UpdateKycDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateKyc(req.user.id, dto);
  }

  @Patch('me/location')
  async updateLocation(
    @Request() req,
    @Body() dto: UpdateLocationDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateLocation(req.user.id, dto);
  }
}
