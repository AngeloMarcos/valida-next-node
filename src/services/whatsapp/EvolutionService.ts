import axios, { AxiosInstance } from 'axios';

interface CreateInstancePayload {
  instanceName: string;
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  number?: string;
  qrcode?: boolean;
}

class EvolutionService {
  private client: AxiosInstance;
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL;
    this.apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
    this.webhookSecret = import.meta.env.VITE_EVOLUTION_WEBHOOK_SECRET;

    if (!apiUrl || !this.apiKey) {
      console.warn('Evolution API credentials not configured');
    }

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
    });
  }

  async createInstance(payload: CreateInstancePayload): Promise<any> {
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

      const response = await this.client.post('/instance/create', {
        ...payload,
        qrcode: true,
        webhook: {
          url: webhookUrl,
          byEvents: true,
          base64: true,
          headers: {
            'Authorization': `Bearer ${this.webhookSecret}`,
          },
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE',
            'CALL',
          ],
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Evolution Create Instance Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getQRCode(instanceName: string): Promise<string> {
    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`);
      const qrCode = response.data.qrcode;

      if (typeof qrCode === 'object' && qrCode.imageUrl) {
        return qrCode.imageUrl;
      }
      return qrCode;
    } catch (error: any) {
      console.error('Evolution QR Code Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConnectionStatus(instanceName: string): Promise<string> {
    try {
      const response = await this.client.get(`/instance/connectionState/${instanceName}`);
      return response.data.instance?.state || 'disconnected';
    } catch (error: any) {
      console.error('Evolution Status Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async listInstances(): Promise<any[]> {
    try {
      const response = await this.client.get('/instance/fetchInstances');
      return response.data.instances || [];
    } catch (error: any) {
      console.error('Evolution List Instances Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessage(instanceName: string, phone: string, message: string): Promise<any> {
    try {
      const formattedPhone = this.formatPhone(phone);
      const response = await this.client.post(`/message/sendText/${instanceName}`, {
        number: formattedPhone,
        text: message,
      });
      return response.data;
    } catch (error: any) {
      console.error('Evolution Send Message Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await this.client.delete(`/instance/delete/${instanceName}`);
    } catch (error: any) {
      console.error('Evolution Delete Error:', error.response?.data || error.message);
      throw error;
    }
  }

  formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  }
}

export const evolutionService = new EvolutionService();
