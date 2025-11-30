import { LayoutDashboard, Users, FileText, LogOut, Building2, Package, UserCog, Activity, Menu, MessageCircle, RefreshCw, Kanban } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import logoCompleto from "@/assets/logo-completo.png";
import logoIcon from "@/assets/logo-icon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Propostas", url: "/propostas", icon: FileText },
  { title: "Kanban de Vendas", url: "/propostas/kanban", icon: Kanban },
  { title: "Renovações", url: "/renovacoes", icon: RefreshCw },
  { title: "Conversas WhatsApp", url: "/whatsapp/conversas", icon: MessageCircle },
  { title: "Usuários", url: "/users", icon: UserCog, adminOnly: true },
  { title: "Log de Atividades", url: "/activity-log", icon: Activity, managerAccess: true },
];

const cadastrosItems = [
  { title: "Clientes", url: "/cadastros/clientes", icon: Users },
  { title: "Bancos", url: "/cadastros/bancos", icon: Building2 },
  { title: "Produtos", url: "/cadastros/produtos", icon: Package },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, isSupervisor } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
        {!collapsed ? (
          <div className="flex items-center justify-between px-4 py-5">
            <div className="flex-1 flex items-center justify-start">
              <img 
                src={logoCompleto} 
                alt="AprovaCRM" 
                className="h-14 w-auto object-contain max-w-[200px]" 
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3 gap-2 w-full">
            <div className="w-full flex justify-center py-1">
              <img 
                src={logoIcon} 
                alt="AprovaCRM" 
                className="h-9 w-9 object-contain" 
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>CRM</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Hide admin-only items for non-admin users
                if (item.adminOnly && !isAdmin) {
                  return null;
                }
                // Hide manager-access items for agents
                if (item.managerAccess && !isAdmin && !isSupervisor) {
                  return null;
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={currentPath === item.url}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 hover:bg-sidebar-accent"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>CADASTROS</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {cadastrosItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={currentPath === item.url}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip={collapsed ? "Sair" : undefined}
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
