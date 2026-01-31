import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  bankCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  accountHolder: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class BankAccountDto {
  id: number;
  accountNumber: string; // Masked: ****1234
  bankCode: string;
  accountHolder: string;
  isPrimary: boolean;
  createdAt: string;
}

export class BankAccountListDto {
  accounts: BankAccountDto[];
  total: number;
}
