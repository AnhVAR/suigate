import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminUsersService } from './admin-users.service';
import {
  AdminUsersQueryDto,
  UpdateKycDto,
  LockUserDto,
} from './dto/admin-users.dto';

@Controller('admin/users')
@UseGuards(AdminAuthGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }

  @Get(':id')
  async getUserDetail(@Param('id') id: string) {
    return this.adminUsersService.getUserDetail(id);
  }

  @Patch(':id/kyc')
  async updateKyc(
    @Param('id') id: string,
    @Body() dto: UpdateKycDto,
    @Request() req,
  ) {
    await this.adminUsersService.updateKyc(id, dto, req.user.id);
    return { success: true };
  }

  @Post(':id/lock')
  async lockUser(
    @Param('id') id: string,
    @Body() dto: LockUserDto,
    @Request() req,
  ) {
    await this.adminUsersService.lockUser(id, dto, req.user.id);
    return { success: true };
  }

  @Post(':id/unlock')
  async unlockUser(@Param('id') id: string, @Request() req) {
    await this.adminUsersService.unlockUser(id, req.user.id);
    return { success: true };
  }
}
