import { Injectable } from '@nestjs/common';

export interface ValidationResult {
  eligible: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

@Injectable()
export class CreditValidationService {
  async validate(proposal: any): Promise<ValidationResult> {
    console.log(`Validando proposta ${proposal.id} (MOCK)`);
    let score = 100;
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!proposal.client?.email) {
      score -= 10;
      warnings.push('Email não informado');
    }

    if (!proposal.client?.cpf) {
      score -= 15;
      warnings.push('CPF não informado');
    }

    if (proposal.requestedAmount < 1000) {
      score -= 100;
      errors.push('Valor solicitado abaixo do mínimo de R$ 1.000');
    }

    if (proposal.requestedAmount > 100000) {
      score -= 20;
      warnings.push('Valor acima de R$ 100.000 requer análise adicional');
    }

    return {
      eligible: score >= 50 && errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations:
        score < 70 ? ['Considere solicitar documentação adicional'] : [],
    };
  }
}
