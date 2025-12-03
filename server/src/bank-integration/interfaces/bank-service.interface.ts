export interface IBankService {
  submitProposal(proposalData: any): Promise<{
    success: boolean;
    externalId?: string;
    error?: string;
  }>;
  
  getProposalStatus(externalId: string): Promise<{
    status: string;
    details: any;
  }>;
}
