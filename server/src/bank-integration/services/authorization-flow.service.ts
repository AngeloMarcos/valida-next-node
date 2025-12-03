import { Injectable } from '@nestjs/common';
import { CreditValidationService, ValidationResult } from './credit-validation.service';
import { BradescoStrategy } from '../strategies/bradesco.strategy';
import { ItauStrategy } from '../strategies/itau.strategy';
import { BancoBrasilStrategy } from '../strategies/bb.strategy';
import { IBankService } from '../interfaces/bank-service.interface';

interface FlowState {
  step: string;
  validationResult?: ValidationResult;
  bankResponse?: { success: boolean; externalId?: string };
  bankCode?: string;
}

@Injectable()
export class AuthorizationFlowService {
  private flowState = new Map<number, FlowState>();

  constructor(
    private readonly validationService: CreditValidationService,
    private readonly bradescoStrategy: BradescoStrategy,
    private readonly itauStrategy: ItauStrategy,
    private readonly bbStrategy: BancoBrasilStrategy,
  ) {}

  private getBankStrategy(bankCode: string): IBankService {
    switch (bankCode) {
      case 'bradesco':
        return this.bradescoStrategy;
      case 'itau':
        return this.itauStrategy;
      case 'bb':
        return this.bbStrategy;
      default:
        return this.bradescoStrategy;
    }
  }

  async start(proposalId: number, bankCode: string) {
    // Mock de proposta para teste
    const proposal = {
      id: proposalId,
      requestedAmount: 10000,
      status: 'open',
      client: {
        id: 1,
        name: 'João da Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-00',
      },
    };

    const validationResult = await this.validationService.validate(proposal);

    if (!validationResult.eligible) {
      this.flowState.set(proposalId, {
        step: 'failed',
        validationResult,
        bankCode,
      });
      return { 
        success: false, 
        validationResult,
        proposalId,
        clientName: proposal.client.name,
        productName: 'Crédito Pessoal',
        requestedAmount: proposal.requestedAmount,
        currentStatus: 'rejected',
        flowStep: 'failed',
        validationScore: validationResult.score,
        validationEligible: validationResult.eligible,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        recommendations: validationResult.recommendations,
        timestamp: new Date().toISOString(),
      };
    }

    this.flowState.set(proposalId, {
      step: 'validation_ok',
      validationResult,
      bankCode,
    });

    const bankStrategy = this.getBankStrategy(bankCode);
    const bankResponse = await bankStrategy.submitProposal(proposal);

    if (!bankResponse.success) {
      this.flowState.set(proposalId, {
        ...this.flowState.get(proposalId),
        step: 'failed',
        bankResponse,
      });
      return { 
        success: false, 
        bankResponse,
        proposalId,
        clientName: proposal.client.name,
        productName: 'Crédito Pessoal',
        requestedAmount: proposal.requestedAmount,
        currentStatus: 'rejected',
        flowStep: 'failed',
        validationScore: validationResult.score,
        validationEligible: validationResult.eligible,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        recommendations: validationResult.recommendations,
        timestamp: new Date().toISOString(),
      };
    }

    this.flowState.set(proposalId, {
      ...this.flowState.get(proposalId),
      step: 'awaiting_response',
      bankResponse,
    });

    return { 
      success: true, 
      validationResult, 
      bankResponse,
      proposalId,
      clientName: proposal.client.name,
      productName: 'Crédito Pessoal',
      requestedAmount: proposal.requestedAmount,
      currentStatus: 'in_analysis',
      flowStep: 'awaiting_response',
      validationScore: validationResult.score,
      validationEligible: validationResult.eligible,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      recommendations: validationResult.recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  async getSummary(proposalId: number) {
    const state = this.flowState.get(proposalId);

    // Mock de proposta
    const proposal = {
      id: proposalId,
      requestedAmount: 10000,
      status: state?.step === 'awaiting_response' ? 'in_analysis' : 'open',
      client: { name: 'João da Silva' },
    };

    // Simulate progress - randomly complete after a few checks
    if (state?.step === 'awaiting_response' && Math.random() > 0.6) {
      this.flowState.set(proposalId, {
        ...state,
        step: 'completed',
      });
    }

    const currentState = this.flowState.get(proposalId);

    return {
      proposalId,
      clientName: proposal.client.name,
      productName: 'Crédito Pessoal',
      requestedAmount: proposal.requestedAmount,
      currentStatus: currentState?.step === 'completed' ? 'approved' : proposal.status,
      flowStep: currentState?.step || 'unknown',
      validationScore: currentState?.validationResult?.score || 0,
      validationEligible: currentState?.validationResult?.eligible || false,
      errors: currentState?.validationResult?.errors || [],
      warnings: currentState?.validationResult?.warnings || [],
      recommendations: currentState?.validationResult?.recommendations || [],
      timestamp: new Date().toISOString(),
    };
  }

  async cancel(proposalId: number) {
    this.flowState.set(proposalId, {
      ...this.flowState.get(proposalId),
      step: 'failed',
    });
    return { message: 'Fluxo cancelado com sucesso' };
  }
}
