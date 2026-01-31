import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VietQrService {
  private readonly logger = new Logger(VietQrService.name);
  private readonly bankCode = 'MB'; // MBBank for SePay
  private readonly accountNumber: string;
  private readonly accountName: string;

  constructor(private config: ConfigService) {
    this.accountNumber =
      this.config.get<string>('sepay.accountNumber') || '0123456789';
    this.accountName =
      this.config.get<string>('sepay.accountName') || 'SUIGATE';
  }

  generateReference(): string {
    // Format: SG-XXXXX (5 random alphanumeric)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'SG-';
    for (let i = 0; i < 5; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  }

  generateQrContent(amount: number, reference: string): string {
    // Return as VietQR URL
    const params = new URLSearchParams({
      bankId: this.bankCode,
      accountNo: this.accountNumber,
      accountName: this.accountName,
      amount: amount.toString(),
      description: reference,
      template: 'compact',
    });

    return `https://img.vietqr.io/image/${this.bankCode}-${this.accountNumber}-compact.png?${params}`;
  }
}
