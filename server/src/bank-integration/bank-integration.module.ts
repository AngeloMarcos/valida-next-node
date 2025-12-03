import { Module } from '@nestjs/common';
import { AuthorizationFlowController } from './controllers/authorization-flow.controller';
import { BankIntegrationController } from './controllers/bank-integration.controller';
import { AuthorizationFlowService } from './services/authorization-flow.service';
import { CreditValidationService } from './services/credit-validation.service';
import { BradescoStrategy } from './strategies/bradesco.strategy';
import { ItauStrategy } from './strategies/itau.strategy';
import { BancoBrasilStrategy } from './strategies/bb.strategy';

@Module({
  controllers: [AuthorizationFlowController, BankIntegrationController],
  providers: [
    AuthorizationFlowService,
    CreditValidationService,
    BradescoStrategy,
    ItauStrategy,
    BancoBrasilStrategy,
  ],
  exports: [AuthorizationFlowService],
})
export class BankIntegrationModule {}
