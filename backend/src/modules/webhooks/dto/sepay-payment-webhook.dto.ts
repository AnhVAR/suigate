export class SepayWebhookDto {
  id: string;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string;
  transferType: 'in' | 'out';
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
}

export class SepayWebhookResponse {
  success: boolean;
  message?: string;
}
