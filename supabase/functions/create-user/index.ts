import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  nome: string;
  role: 'admin' | 'supervisor' | 'correspondente';
  empresa_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, nome, role, empresa_id }: CreateUserRequest = await req.json();

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

    // Create user with admin client (no email confirmation required)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email (sem necessidade de verificação)
      user_metadata: {
        nome,
        empresa_id,
      },
    });

    if (createError) {
      throw createError;
    }

    if (!newUser.user) {
      throw new Error("Failed to create user");
    }

    // Update profile (trigger should have created it)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ nome })
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // Update role if not default
    if (role !== "correspondente") {
      const { error: roleUpdateError } = await supabaseAdmin
        .from("user_roles")
        .update({ role })
        .eq("user_id", newUser.user.id);

      if (roleUpdateError) {
        throw roleUpdateError;
      }
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${req.headers.get("origin") || ""}/`,
    });

    if (resetError) {
      console.error("Password reset error:", resetError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
