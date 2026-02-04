import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminZkLoginDto, AdminSessionDto } from './dto/admin-auth.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('auth/zklogin')
  @HttpCode(200)
  async adminLogin(@Body() dto: AdminZkLoginDto): Promise<AdminSessionDto> {
    return this.adminService.zkLoginAuth(dto);
  }
}
