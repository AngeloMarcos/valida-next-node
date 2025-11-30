import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório")
    .transform((value) => value?.trim()),
});

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast.error("Erro ao enviar e-mail de recuperação", {
          description: error.message,
        });
        return;
      }

      setEmailSent(true);
      toast.success("E-mail enviado com sucesso!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast.error("Erro inesperado", {
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center pt-2 pb-3">
            <img 
              src={logoIcon} 
              alt="AprovaCRM" 
              className="h-20 w-20 object-contain" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-center text-base">
            {emailSent 
              ? "E-mail enviado com sucesso"
              : "Digite seu e-mail para receber instruções de recuperação"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de recuperação para o seu e-mail.
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e spam.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  asChild
                  disabled={loading}
                >
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Login
                  </Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}