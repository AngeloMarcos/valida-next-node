import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhatsApp() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">WhatsApp</h1>
            <p className="text-muted-foreground mt-1">
              Integração com WhatsApp Business API
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>

        <Card className="border-[#25D366]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                </div>
                <div>
                  <CardTitle>Status da Integração</CardTitle>
                  <CardDescription>
                    Conexão com a API do WhatsApp
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-muted">
                Desconectado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Integração em Desenvolvimento
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Em breve você poderá gerenciar todas as suas conversas do WhatsApp
                diretamente no CRM. Configure sua API do WhatsApp Business para começar.
              </p>
              <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                Configurar API
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversas</CardTitle>
              <CardDescription>
                Lista de conversas ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma conversa disponível</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensagens Recentes</CardTitle>
              <CardDescription>
                Últimas mensagens recebidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma mensagem disponível</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
