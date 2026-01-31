import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import {
  CreateBankAccountDto,
  BankAccountDto,
  BankAccountListDto,
} from './dto/bank-account-crud.dto';

@Injectable()
export class BankAccountsService {
  private readonly logger = new Logger(BankAccountsService.name);

  constructor(private supabase: SupabaseService) {}

  async listAccounts(userId: string): Promise<BankAccountListDto> {
    const { data, error, count } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error('Failed to fetch bank accounts');

    const accounts = (data || []).map((row) => this.mapToDto(row));

    return { accounts, total: count || 0 };
  }

  async addAccount(
    userId: string,
    dto: CreateBankAccountDto,
  ): Promise<BankAccountDto> {
    // Check limit (max 5 accounts per user)
    const { count } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count || 0) >= 5) {
      throw new BadRequestException('Maximum 5 bank accounts allowed');
    }

    // Encrypt account number
    const encryptedNumber = this.supabase.encrypt(dto.accountNumber);

    // If setting as primary, unset other primaries
    if (dto.isPrimary) {
      await this.supabase
        .getClient()
        .from('bank_accounts')
        .update({ is_primary: false })
        .eq('user_id', userId);
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .insert({
        user_id: userId,
        account_number_encrypted: encryptedNumber,
        bank_code: dto.bankCode,
        account_holder: dto.accountHolder,
        is_primary: dto.isPrimary || false,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to add bank account', error);
      throw new Error('Failed to add bank account');
    }

    // Return with masked number
    return {
      ...this.mapToDto(data),
      accountNumber: this.maskAccountNumber(dto.accountNumber),
    };
  }

  async deleteAccount(userId: string, accountId: number): Promise<void> {
    // Verify ownership
    const { data: existing } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw new NotFoundException('Bank account not found');
    }

    // Check if account is used in pending orders
    const { count } = await this.supabase
      .getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('bank_account_id', accountId)
      .in('status', ['pending', 'processing']);

    if ((count || 0) > 0) {
      throw new BadRequestException(
        'Cannot delete account with pending orders',
      );
    }

    const { error } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw new Error('Failed to delete bank account');
  }

  // Get decrypted account number (internal use only)
  async getDecryptedAccountNumber(
    userId: string,
    accountId: number,
  ): Promise<string> {
    const { data } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .select('account_number_encrypted')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (!data) throw new NotFoundException('Bank account not found');

    return this.supabase.decrypt(data.account_number_encrypted);
  }

  private mapToDto(row: any): BankAccountDto {
    // Decrypt and mask account number
    let maskedNumber = '****';
    try {
      const decrypted = this.supabase.decrypt(row.account_number_encrypted);
      maskedNumber = this.maskAccountNumber(decrypted);
    } catch {
      this.logger.warn(`Failed to decrypt account ${row.id}`);
    }

    return {
      id: row.id,
      accountNumber: maskedNumber,
      bankCode: row.bank_code,
      accountHolder: row.account_holder,
      isPrimary: row.is_primary,
      createdAt: row.created_at,
    };
  }

  private maskAccountNumber(number: string): string {
    if (number.length <= 4) return '****';
    return '****' + number.slice(-4);
  }
}
