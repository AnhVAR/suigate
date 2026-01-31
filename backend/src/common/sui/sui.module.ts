import { Global, Module } from '@nestjs/common';
import { SuiClientService } from './sui-client.service';

@Global()
@Module({
  providers: [SuiClientService],
  exports: [SuiClientService],
})
export class SuiModule {}
