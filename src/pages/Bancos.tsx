import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { api, Bank } from "@/lib/api";
import { toast } from "sonner";

export default function Bancos() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    is_active: true,
    notes: "",
  });

  const loadData = async () => {
    try {
      const banksData = await api.getBanks();
      setBanks(banksData);
      setFilteredBanks(banksData);
    } catch (error) {
      toast.error("Erro ao carregar bancos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = banks;

    if (searchTerm) {
      filtered = filtered.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "true";
      filtered = filtered.filter(bank => bank.is_active === isActive);
    }

    setFilteredBanks(filtered);
  }, [searchTerm, statusFilter, banks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await api.updateBank(editingBank.id, formData);
        toast.success("Banco atualizado com sucesso!");
      } else {
        await api.createBank(formData);
        toast.success("Banco cadastrado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar banco");
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      code: bank.code,
      logo_url: bank.logo_url || "",
      contact_email: bank.contact_email || "",
      contact_phone: bank.contact_phone || "",
      is_active: bank.is_active,
      notes: bank.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (bank: Bank) => {
    try {
      await api.updateBank(bank.id, { is_active: !bank.is_active });
      toast.success(`Banco ${!bank.is_active ? 'ativado' : 'desativado'} com sucesso!`);
      loadData();
    } catch (error) {
      toast.error("Erro ao alterar status do banco");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este banco?")) {
      try {
        await api.deleteBank(id);
        toast.success("Banco excluído com sucesso!");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir banco");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      logo_url: "",
      contact_email: "",
      contact_phone: "",
      is_active: true,
      notes: "",
    });
    setEditingBank(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Bancos</h2>
            <p className="text-muted-foreground">
              Gerencie os bancos parceiros do sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Banco
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingBank ? "Editar Banco" : "Novo Banco"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do banco abaixo
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Banco *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Banco do Brasil"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código *</Label>
                    <Input
                      id="code"
                      placeholder="Ex: 001"
                      maxLength={3}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">URL do Logo</Label>
                    <Input
                      id="logo_url"
                      placeholder="https://..."
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de Contato</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="contato@banco.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Telefone</Label>
                    <Input
                      id="contact_phone"
                      placeholder="(00) 0000-0000"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Banco Ativo</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Informações adicionais..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '60px' }}>Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead style={{ width: '80px' }}>Código</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredBanks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum banco encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredBanks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell>
                      {bank.logo_url ? (
                        <img src={bank.logo_url} alt={bank.name} className="h-8 w-8 rounded object-contain" />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{bank.name}</TableCell>
                    <TableCell>{bank.code}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {bank.contact_email && <div>{bank.contact_email}</div>}
                        {bank.contact_phone && <div className="text-muted-foreground">{bank.contact_phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bank.is_active ? "default" : "secondary"}>
                        {bank.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bank)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(bank)}
                        >
                          <Switch checked={bank.is_active} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bank.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
