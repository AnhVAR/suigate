import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateBankAccountDto,
  BankAccountDto,
  BankAccountListDto,
} from './dto/bank-account-crud.dto';

@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private bankAccountsService: BankAccountsService) {}

  @Get()
  async listAccounts(@Request() req): Promise<BankAccountListDto> {
    return this.bankAccountsService.listAccounts(req.user.id);
  }

  @Post()
  async addAccount(
    @Request() req,
    @Body() dto: CreateBankAccountDto,
  ): Promise<BankAccountDto> {
    return this.bankAccountsService.addAccount(req.user.id, dto);
  }

  @Delete(':id')
  async deleteAccount(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.bankAccountsService.deleteAccount(req.user.id, id);
    return { success: true };
  }
}
