import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export class SepayWebhookDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  gateway: string;

  @IsString()
  @IsNotEmpty()
  transactionDate: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsOptional()
  subAccount: string | null;

  @IsString()
  @IsOptional()
  code: string | null;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['in', 'out'])
  transferType: 'in' | 'out';

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  transferAmount: number;

  @IsString()
  @IsOptional()
  referenceCode: string;

  @IsNumber()
  accumulated: number;
}

export class SepayWebhookResponse {
  success: boolean;
  message?: string;
}
