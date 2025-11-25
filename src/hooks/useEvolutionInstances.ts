import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { evolutionService } from '@/services/whatsapp/EvolutionService';
import { toast } from '@/hooks/use-toast';

export function useEvolutionInstances() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<any[]>([]);

  const fetchInstances = useCallback(async () => {
    if (!profile?.empresa_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (error: any) {
      console.error('Fetch instances error:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar instâncias WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.empresa_id]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const createInstance = useCallback(
    async (instanceName: string) => {
      if (!profile?.empresa_id) {
        toast({
          title: 'Erro',
          description: 'Empresa não identificada',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      try {
        const fullInstanceName = `${profile.empresa_id}-${instanceName}`.replace(/[^a-zA-Z0-9-]/g, '-');
        
        const evolutionResponse = await evolutionService.createInstance({
          instanceName: fullInstanceName,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: true,
        });

        const { error } = await supabase.from('whatsapp_instances').insert({
          empresa_id: profile.empresa_id,
          instance_name: evolutionResponse.instance.instanceName,
          instance_id: evolutionResponse.instance.instanceId || evolutionResponse.instance.instanceName,
          api_key: evolutionResponse.hash?.apikey || import.meta.env.VITE_EVOLUTION_API_KEY,
          status: 'pending',
          qr_code_url: evolutionResponse.qrcode?.base64 || evolutionResponse.qrcode,
          integration_type: 'WHATSAPP-BAILEYS',
        });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Instância WhatsApp criada. Escaneie o QR Code para conectar.',
        });

        await fetchInstances();
        return evolutionResponse;
      } catch (error: any) {
        console.error('Create instance error:', error);
        toast({
          title: 'Erro ao criar instância',
          description: error.response?.data?.message || error.message || 'Falha ao criar instância WhatsApp',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [profile?.empresa_id, fetchInstances]
  );

  const getQRCode = useCallback(async (instanceName: string) => {
    try {
      const qrCode = await evolutionService.getQRCode(instanceName);
      return qrCode;
    } catch (error: any) {
      console.error('Get QR code error:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao obter QR Code',
        variant: 'destructive',
      });
    }
  }, []);

  const checkStatus = useCallback(async (instanceName: string) => {
    try {
      const status = await evolutionService.getConnectionStatus(instanceName);

      await supabase
        .from('whatsapp_instances')
        .update({
          status: status === 'open' ? 'connected' : 'disconnected',
          connected_at: status === 'open' ? new Date().toISOString() : null,
        })
        .eq('instance_name', instanceName);

      await fetchInstances();
      return status;
    } catch (error: any) {
      console.error('Check status error:', error);
      return 'disconnected';
    }
  }, [fetchInstances]);

  const sendMessage = useCallback(
    async (instanceName: string, phone: string, message: string) => {
      if (!profile?.empresa_id) return;

      try {
        const result = await evolutionService.sendMessage(instanceName, phone, message);

        const instance = instances.find(i => i.instance_name === instanceName);
        if (!instance) return result;

        const formattedPhone = evolutionService.formatPhone(phone);

        const { data: conversation } = await supabase
          .from('conversas')
          .select('id')
          .eq('whatsapp_instance_id', instance.id)
          .eq('telefone', formattedPhone)
          .single();

        if (conversation) {
          await supabase.from('mensagens').insert({
            empresa_id: profile.empresa_id,
            conversa_id: conversation.id,
            tipo: 'text',
            mensagem: message,
            direction: 'outgoing',
            status: 'enviado',
            sender_phone: instance.phone_number,
          });
        }

        toast({
          title: 'Mensagem enviada',
          description: 'A mensagem foi enviada com sucesso',
        });

        return result;
      } catch (error: any) {
        console.error('Send message error:', error);
        toast({
          title: 'Erro ao enviar',
          description: error.response?.data?.message || 'Falha ao enviar mensagem',
          variant: 'destructive',
        });
      }
    },
    [instances, profile?.empresa_id]
  );

  const deleteInstance = useCallback(
    async (instanceName: string, instanceId: string) => {
      try {
        await evolutionService.deleteInstance(instanceName);
        
        const { error } = await supabase
          .from('whatsapp_instances')
          .delete()
          .eq('id', instanceId);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Instância WhatsApp removida',
        });

        await fetchInstances();
      } catch (error: any) {
        console.error('Delete instance error:', error);
        toast({
          title: 'Erro ao deletar',
          description: error.message || 'Falha ao deletar instância',
          variant: 'destructive',
        });
      }
    },
    [fetchInstances]
  );

  return {
    instances,
    loading,
    createInstance,
    getQRCode,
    checkStatus,
    sendMessage,
    deleteInstance,
    refreshInstances: fetchInstances,
  };
}
