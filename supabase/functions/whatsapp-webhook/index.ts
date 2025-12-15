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

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Phone validation: 10-15 digits after removing non-numeric characters
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook secret from Evolution API
    const authHeader = req.headers.get('Authorization');
    const expectedSecret = Deno.env.get('EVOLUTION_WEBHOOK_SECRET');
    
    // If secret is configured, verify it
    if (expectedSecret) {
      if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
        console.error('Webhook authentication failed: Invalid or missing Authorization header');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('EVOLUTION_WEBHOOK_SECRET not configured - webhook authentication disabled');
    }

    const payload: WebhookPayload = await req.json();
    console.log('Webhook recebido:', { 
      telefone: payload.telefone, 
      empresa_id: payload.empresa_id,
      hasNome: !!payload.nome,
      messageLength: payload.mensagem?.length 
    });

    const { telefone, mensagem, nome, empresa_id } = payload;

    // Validate required fields exist
    if (!telefone || !mensagem || !empresa_id) {
      console.error('Missing required fields:', { telefone: !!telefone, mensagem: !!mensagem, empresa_id: !!empresa_id });
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone format
    if (!isValidPhone(telefone)) {
      console.error('Invalid phone format:', telefone);
      return new Response(
        JSON.stringify({ error: 'Formato de telefone inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate empresa_id is a valid UUID
    if (!UUID_REGEX.test(empresa_id)) {
      console.error('Invalid empresa_id format:', empresa_id);
      return new Response(
        JSON.stringify({ error: 'Formato de empresa_id inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate message length (max 4096 characters)
    if (mensagem.length > 4096) {
      console.error('Message too long:', mensagem.length);
      return new Response(
        JSON.stringify({ error: 'Mensagem muito longa (máximo 4096 caracteres)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize nome if provided (limit length, remove potential XSS)
    const sanitizedNome = nome 
      ? nome.slice(0, 100).replace(/[<>]/g, '') 
      : undefined;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify empresa_id exists in database
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('id', empresa_id)
      .single();

    if (empresaError || !empresa) {
      console.error('Invalid empresa_id - not found in database:', empresa_id);
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          ultimo_texto: mensagem.slice(0, 500), // Limit stored preview
          ultima_data: new Date().toISOString(),
          unread: (existingConversa.unread || 0) + 1
        })
        .eq('id', conversaId);

    } else {
      const nomeContato = sanitizedNome || `Contato ${telefone}`;
      
      const { data: newConversa, error: conversaError } = await supabaseAdmin
        .from('conversas')
        .insert({
          telefone,
          nome: nomeContato,
          ultimo_texto: mensagem.slice(0, 500),
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

    console.log('Mensagem processada com sucesso:', { conversaId, empresa_id });

    return new Response(
      JSON.stringify({ success: true, conversaId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }), // Generic error to avoid leaking details
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
