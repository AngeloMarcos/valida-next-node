import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  telefone: string;
  mensagem: string;
  nome?: string;
  empresa_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    console.log('Webhook recebido:', payload);

    const { telefone, mensagem, nome, empresa_id } = payload;

    if (!telefone || !mensagem || !empresa_id) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingConversa } = await supabaseAdmin
      .from('conversas')
      .select('*')
      .eq('telefone', telefone)
      .eq('empresa_id', empresa_id)
      .single();

    let conversaId: string;

    if (existingConversa) {
      conversaId = existingConversa.id;
      
      await supabaseAdmin
        .from('conversas')
        .update({
          ultimo_texto: mensagem,
          ultima_data: new Date().toISOString(),
          unread: (existingConversa.unread || 0) + 1
        })
        .eq('id', conversaId);

    } else {
      const nomeContato = nome || `Contato ${telefone}`;
      
      const { data: newConversa, error: conversaError } = await supabaseAdmin
        .from('conversas')
        .insert({
          telefone,
          nome: nomeContato,
          ultimo_texto: mensagem,
          ultima_data: new Date().toISOString(),
          origem: 'wpp',
          unread: 1,
          empresa_id
        })
        .select()
        .single();

      if (conversaError) throw conversaError;
      conversaId = newConversa.id;
    }

    const { error: mensagemError } = await supabaseAdmin
      .from('mensagens')
      .insert({
        conversa_id: conversaId,
        mensagem,
        tipo: 'usuario',
        status: 'lido',
        empresa_id
      });

    if (mensagemError) throw mensagemError;

    console.log('Mensagem processada com sucesso');

    return new Response(
      JSON.stringify({ success: true, conversaId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
