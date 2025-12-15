import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Evolution API credentials from environment (server-side only)
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || '';
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || '';
const EVOLUTION_WEBHOOK_SECRET = Deno.env.get('EVOLUTION_WEBHOOK_SECRET') || '';

interface CreateInstancePayload {
  instanceName: string;
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  number?: string;
  qrcode?: boolean;
}

interface SendMessagePayload {
  instanceName: string;
  phone: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token using Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's empresa_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    if (!profile?.empresa_id) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const empresaId = profile.empresa_id;

    // Check if Evolution API is configured
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.warn('Evolution API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Evolution API not configured', mock: true }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    let action = url.searchParams.get('action');
    const body = req.method !== 'GET' ? await req.json() : null;
    
    // Support action from body for POST requests (from supabase.functions.invoke)
    if (body && body._action) {
      action = body._action;
      delete body._action;
    }

    console.log(`Evolution API action: ${action}`, { empresaId, userId: user.id });

    let response;

    switch (action) {
      case 'create-instance': {
        const payload = body as CreateInstancePayload;
        
        // Validate instance name
        if (!payload.instanceName || !/^[a-zA-Z0-9_-]{3,50}$/.test(payload.instanceName)) {
          return new Response(
            JSON.stringify({ error: 'Invalid instance name. Use 3-50 alphanumeric characters, underscores or hyphens.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-webhook`;
        
        response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            ...payload,
            qrcode: true,
            webhook: {
              url: webhookUrl,
              byEvents: true,
              base64: true,
              headers: {
                'Authorization': `Bearer ${EVOLUTION_WEBHOOK_SECRET}`,
              },
              events: [
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'CONNECTION_UPDATE',
                'CALL',
              ],
            },
          }),
        });
        break;
      }

      case 'get-qrcode': {
        const instanceName = url.searchParams.get('instanceName');
        if (!instanceName) {
          return new Response(
            JSON.stringify({ error: 'Instance name required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
        });
        break;
      }

      case 'get-status': {
        const instanceName = url.searchParams.get('instanceName');
        if (!instanceName) {
          return new Response(
            JSON.stringify({ error: 'Instance name required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
        });
        break;
      }

      case 'list-instances': {
        response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
        });
        break;
      }

      case 'send-message': {
        const payload = body as SendMessagePayload;
        
        if (!payload.instanceName || !payload.phone || !payload.message) {
          return new Response(
            JSON.stringify({ error: 'Instance name, phone, and message are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate phone format (10-15 digits after cleaning)
        const cleanPhone = payload.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
          return new Response(
            JSON.stringify({ error: 'Invalid phone number format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Limit message length
        if (payload.message.length > 4096) {
          return new Response(
            JSON.stringify({ error: 'Message too long (max 4096 characters)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Format phone number
        let formattedPhone = cleanPhone;
        if (formattedPhone.length === 11 && formattedPhone.startsWith('0')) {
          formattedPhone = formattedPhone.slice(1);
        }
        if (!formattedPhone.startsWith('55')) {
          formattedPhone = '55' + formattedPhone;
        }

        response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${payload.instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: payload.message,
          }),
        });
        break;
      }

      case 'delete-instance': {
        const instanceName = url.searchParams.get('instanceName');
        if (!instanceName) {
          return new Response(
            JSON.stringify({ error: 'Instance name required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const data = await response.json();
    console.log(`Evolution API response for ${action}:`, { status: response.status });

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Evolution API proxy error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
