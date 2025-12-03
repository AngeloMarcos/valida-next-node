import { Injectable } from '@nestjs/common';
import { IBankService } from '../interfaces/bank-service.interface';

@Injectable()
export class BradescoStrategy implements IBankService {
  async submitProposal(proposalData: any): Promise<{
    success: boolean;
    externalId?: string;
  }> {
    console.log('Enviando proposta para o Bradesco (MOCK)');
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            success: true,
            externalId: `BRD_${Date.now()}`,
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
      status: 'APPROVED',
      details: { message: 'Proposta aprovada via mock' },
    };
  }
}
