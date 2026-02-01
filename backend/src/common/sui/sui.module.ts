import { Global, Module } from '@nestjs/common';
import { SuiClientService } from './sui-client.service';
import { SuiTransactionService } from './sui-transaction.service';

@Global()
@Module({
  providers: [SuiClientService, SuiTransactionService],
  exports: [SuiClientService, SuiTransactionService],
})
export class SuiModule {}
