import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

// Redirect helper para rotas com parâmetros dinâmicos
function RedirectToPropostaDetalhes() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/propostas/${id}`} replace />;
}
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Propostas from "./pages/Propostas";
import KanbanPropostas from "./pages/KanbanPropostas";
import CreateProposta from "./pages/CreateProposta";
import PropostaDetalhes from "./pages/PropostaDetalhes";
import BankIntegration from "./pages/BankIntegration";
import Bancos from "./pages/Bancos";
import Produtos from "./pages/Produtos";
import Users from "./pages/Users";
import ActivityLog from "./pages/ActivityLog";
import WhatsApp from "./pages/WhatsApp";
import WhatsAppConversas from "./pages/WhatsAppConversas";
import Renovacoes from "./pages/Renovacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Rotas de Cadastros */}
            <Route path="/cadastros/clientes" element={<Clientes />} />
            <Route path="/cadastros/bancos" element={<Bancos />} />
            <Route path="/cadastros/produtos" element={<Produtos />} />
            
            {/* Rotas antigas mantidas para compatibilidade */}
            <Route path="/clientes" element={<Navigate to="/cadastros/clientes" replace />} />
            <Route path="/bancos" element={<Navigate to="/cadastros/bancos" replace />} />
            <Route path="/produtos" element={<Navigate to="/cadastros/produtos" replace />} />
            
            <Route path="/propostas" element={<Propostas />} />
            <Route path="/propostas/kanban" element={<KanbanPropostas />} />
            <Route path="/propostas/criar" element={<CreateProposta />} />
            <Route path="/propostas/:proposalId/bank-integration" element={<BankIntegration />} />
            <Route path="/propostas/:id/detalhes" element={<RedirectToPropostaDetalhes />} />
            <Route path="/propostas/:id" element={<PropostaDetalhes />} />
            <Route path="/users" element={<Users />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/renovacoes" element={<Renovacoes />} />
            <Route path="/whatsapp" element={<WhatsApp />} />
            <Route path="/whatsapp/conversas" element={<WhatsAppConversas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
