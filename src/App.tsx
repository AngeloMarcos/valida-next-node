import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Propostas from "./pages/Propostas";
import PropostaDetail from "./pages/PropostaDetail";
import PropostaDetalhes from "./pages/PropostaDetalhes";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/propostas" element={<Propostas />} />
            <Route path="/propostas/:id/detalhes" element={<PropostaDetalhes />} />
            <Route path="/propostas/:id" element={<PropostaDetail />} />
            <Route path="/bancos" element={<Bancos />} />
            <Route path="/produtos" element={<Produtos />} />
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
