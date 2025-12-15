import { supabase } from '@/integrations/supabase/client';

interface CreateInstancePayload {
  instanceName: string;
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  number?: string;
  qrcode?: boolean;
}

interface CreateInstanceResponse {
  instance: {
    instanceName: string;
    instanceId?: string;
  };
  hash?: {
    apikey?: string;
  };
  qrcode?: string | { base64?: string; imageUrl?: string };
}

interface QRCodeResponse {
  qrcode?: string | { imageUrl?: string };
}

interface ConnectionStatusResponse {
  instance?: {
    state?: string;
  };
}

interface ListInstancesResponse {
  instances?: unknown[];
}

class EvolutionService {
  private async invokeEdgeFunction<T = unknown>(
    action: string, 
    params?: Record<string, string>, 
    body?: unknown
  ): Promise<T> {
    const queryParams = new URLSearchParams({ action, ...params });
    
    // For requests with body, use supabase.functions.invoke
    if (body && typeof body === 'object') {
      const { data, error } = await supabase.functions.invoke('evolution-api', {
        body: { ...(body as Record<string, unknown>), _action: action },
      });

      if (error) {
        console.error('Evolution API error:', error);
        throw error;
      }

      return data as T;
    }

    // For GET requests with params, use fetch directly
    const session = await supabase.auth.getSession();
    const response = await fetch(
      `https://dxuxjwfaqdmjytpxglru.supabase.co/functions/v1/evolution-api?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }

  async createInstance(payload: CreateInstancePayload): Promise<CreateInstanceResponse> {
    try {
      const data = await this.invokeEdgeFunction<CreateInstanceResponse>('create-instance', undefined, payload);
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evolution Create Instance Error:', errorMessage);
      throw error;
    }
  }

  async getQRCode(instanceName: string): Promise<string> {
    try {
      const data = await this.invokeEdgeFunction<QRCodeResponse>('get-qrcode', { instanceName });
      const qrCode = data.qrcode;

      if (typeof qrCode === 'object' && qrCode?.imageUrl) {
        return qrCode.imageUrl;
      }
      return qrCode as string || '';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evolution QR Code Error:', errorMessage);
      throw error;
    }
  }

  async getConnectionStatus(instanceName: string): Promise<string> {
    try {
      const data = await this.invokeEdgeFunction<ConnectionStatusResponse>('get-status', { instanceName });
      return data.instance?.state || 'disconnected';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evolution Status Error:', errorMessage);
      throw error;
    }
  }

  async listInstances(): Promise<unknown[]> {
    try {
      const data = await this.invokeEdgeFunction<ListInstancesResponse>('list-instances');
      return data.instances || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evolution List Instances Error:', errorMessage);
      throw error;
    }
  }

  async sendMessage(instanceName: string, phone: string, message: string): Promise<unknown> {
    try {
      const data = await this.invokeEdgeFunction('send-message', undefined, {
        instanceName,
        phone,
        message,
      });
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evolution Send Message Error:', errorMessage);
      throw error;
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await this.invokeEdgeFunction('delete-instance', { instanceName });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evolution Delete Error:', errorMessage);
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
