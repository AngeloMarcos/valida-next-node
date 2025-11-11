import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BancoOption {
  id: string;
  nome: string;
}

export function useBancosSelect() {
  const [bancos, setBancos] = useState<BancoOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBancos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bancos')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) throw error;

      setBancos(data as BancoOption[]);
    } catch (error: any) {
      toast.error('Erro ao carregar bancos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBancos();
  }, []);

  return { bancos, loading };
}
