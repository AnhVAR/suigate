import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZkLoginDto, ZkLoginResponseDto } from './dto/zklogin-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('zklogin')
  @HttpCode(200)
  async zkLogin(@Body() dto: ZkLoginDto): Promise<ZkLoginResponseDto> {
    return this.authService.zkLogin(dto);
  }
}
