import { Injectable } from '@nestjs/common';
import { IBankService } from '../interfaces/bank-service.interface';

@Injectable()
export class ItauStrategy implements IBankService {
  async submitProposal(proposalData: any): Promise<{
    success: boolean;
    externalId?: string;
  }> {
    console.log('Enviando proposta para o Itaú (MOCK)');
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            success: true,
            externalId: `ITAU_${Date.now()}`,
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
      status: 'PENDING',
      details: { message: 'Proposta pendente via mock' },
    };
  }
}
