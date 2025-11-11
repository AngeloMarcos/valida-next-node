import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { api, Proposal, Client } from "@/lib/api";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/table";
import { FormInput, FormSelect } from "@/components/form";

const statusColors = {
  aberta: "bg-blue-500",
  em_analise: "bg-yellow-500",
  aprovada: "bg-green-500",
  reprovada: "bg-red-500",
};

const statusLabels = {
  aberta: "Aberta",
  em_analise: "Em Análise",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
};

const proposalSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  status: z.enum(["aberta", "em_analise", "aprovada", "reprovada"]),
  amount: z.string().min(1, "Valor é obrigatório"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

export default function Propostas() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
      status: "aberta",
      amount: "",
      clientId: "",
    },
  });

  const loadData = async () => {
    try {
      const [proposalsData, clientsData] = await Promise.all([
        api.getProposals(),
        api.getClients(),
      ]);
      setProposals(proposalsData);
      setClients(clientsData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (data: ProposalFormData) => {
    try {
      const proposalData = {
        title: data.title,
        status: data.status,
        clientId: data.clientId,
        amount: parseFloat(data.amount),
        userId: "1",
      };

      if (editingProposal) {
        await api.updateProposal(editingProposal.id, proposalData);
        toast.success("Proposta atualizada com sucesso!");
      } else {
        await api.createProposal(proposalData);
        toast.success("Proposta criada com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar proposta");
    }
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    form.reset({
      title: proposal.title,
      status: proposal.status,
      amount: proposal.amount.toString(),
      clientId: proposal.clientId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (proposal: Proposal) => {
    if (confirm("Tem certeza que deseja excluir esta proposta?")) {
      try {
        await api.deleteProposal(proposal.id);
        toast.success("Proposta excluída com sucesso!");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir proposta");
      }
    }
  };

  const resetForm = () => {
    form.reset({
      title: "",
      status: "aberta",
      amount: "",
      clientId: "",
    });
    setEditingProposal(null);
  };

  const columns: DataTableColumn<Proposal>[] = [
    {
      key: "title",
      label: "Título",
      className: "font-medium",
    },
    {
      key: "clientName",
      label: "Cliente",
    },
    {
      key: "amount",
      label: "Valor",
      render: (proposal) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(proposal.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (proposal) => (
        <Badge className={statusColors[proposal.status]}>
          {statusLabels[proposal.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Ações",
    },
  ];

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const statusOptions = [
    { value: "aberta", label: "Aberta" },
    { value: "em_analise", label: "Em Análise" },
    { value: "aprovada", label: "Aprovada" },
    { value: "reprovada", label: "Reprovada" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Propostas</h2>
            <p className="text-muted-foreground">
              Gerencie as propostas comerciais
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProposal ? "Editar Proposta" : "Nova Proposta"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados da proposta abaixo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormInput
                      name="title"
                      label="Título"
                      placeholder="Digite o título da proposta"
                    />
                    <FormSelect
                      name="clientId"
                      label="Cliente"
                      placeholder="Selecione um cliente"
                      options={clientOptions}
                    />
                    <FormInput
                      name="amount"
                      label="Valor (R$)"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <FormSelect
                      name="status"
                      label="Status"
                      options={statusOptions}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </FormProvider>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          data={proposals}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Nenhuma proposta cadastrada"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
