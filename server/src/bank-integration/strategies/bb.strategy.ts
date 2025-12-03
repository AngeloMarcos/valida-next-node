import { Injectable } from '@nestjs/common';
import { IBankService } from '../interfaces/bank-service.interface';

@Injectable()
export class BancoBrasilStrategy implements IBankService {
  async submitProposal(proposalData: any): Promise<{
    success: boolean;
    externalId?: string;
  }> {
    console.log('Enviando proposta para o Banco do Brasil (MOCK)');
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            success: true,
            externalId: `BB_${Date.now()}`,
          }),
        1500
      )
    );
  }

  async getProposalStatus(externalId: string): Promise<{
    status: string;
    details: any;
  }> {
    return {
      status: 'IN_ANALYSIS',
      details: { message: 'Proposta em análise via mock' },
    };
  }
}
