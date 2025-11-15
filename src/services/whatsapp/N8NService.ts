import { N8NWebhookPayload } from '@/types/whatsapp';

export class N8NService {
  private static readonly WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

  static async sendMessage(payload: N8NWebhookPayload) {
    try {
      if (!this.WEBHOOK_URL) {
        console.warn('N8N_WEBHOOK_URL não configurado');
        return { success: true, message: 'Mock mode - mensagem não enviada' };
      }

      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no N8NService:', error);
      throw error;
    }
  }
}
