import { Controller, Get } from '@nestjs/common';

@Controller('bank-integration')
export class BankIntegrationController {
  @Get('supported-banks')
  getSupportedBanks() {
    return {
      banks: ['bradesco', 'itau', 'bb'],
    };
  }
}
