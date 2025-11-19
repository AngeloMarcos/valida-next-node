import { useEffect, useState } from 'react';
import { usePropostaDocumentos, PropostaDocumento } from '@/hooks/usePropostaDocumentos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useForm, FormProvider } from 'react-hook-form';
import { LoadingSpinner } from '@/components/shared';

interface PropostaChecklistProps {
  propostaId: string;
}

export function PropostaChecklist({ propostaId }: PropostaChecklistProps) {
  const { loading, fetchDocumentos, createDocumento, updateDocumento, deleteDocumento } = usePropostaDocumentos();
  const [documentos, setDocumentos] = useState<PropostaDocumento[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      nome_documento: '',
      obrigatorio: true,
      status_documento: 'pendente',
      observacao: '',
    },
  });

  useEffect(() => {
    loadDocumentos();
  }, [propostaId]);

  const loadDocumentos = async () => {
    const data = await fetchDocumentos(propostaId);
    setDocumentos(data);
  };

  const handleSubmit = async (data: any) => {
    const success = await createDocumento(propostaId, data);
    if (success) {
      setIsDialogOpen(false);
      methods.reset();
      loadDocumentos();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const success = await updateDocumento(id, { 
      status_documento: status,
      data_recebimento: status === 'recebido' ? new Date().toISOString() : undefined
    });
    if (success) loadDocumentos();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este documento?')) {
      const success = await deleteDocumento(id);
      if (success) loadDocumentos();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recebido':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejeitado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      recebido: 'default',
      pendente: 'secondary',
      rejeitado: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading && documentos.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Checklist de Documentos</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Documento
        </Button>
      </div>

      <div className="space-y-2">
        {documentos.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(doc.status_documento)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{doc.nome_documento}</p>
                      {doc.obrigatorio && (
                        <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                      )}
                    </div>
                    {doc.observacao && (
                      <p className="text-sm text-muted-foreground mt-1">{doc.observacao}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status_documento)}
                  <select
                    className="text-sm border rounded px-2 py-1"
                    value={doc.status_documento}
                    onChange={(e) => handleUpdateStatus(doc.id, e.target.value)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="recebido">Recebido</option>
                    <option value="rejeitado">Rejeitado</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
            <DialogDescription>
              Adicione um novo documento ao checklist da proposta
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
              <FormInput
                name="nome_documento"
                label="Nome do Documento"
                placeholder="Ex: RG, CPF, Comprovante de Renda"
                required
              />
              <FormSelect
                name="status_documento"
                label="Status"
                options={[
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'recebido', label: 'Recebido' },
                  { value: 'rejeitado', label: 'Rejeitado' },
                ]}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...methods.register('obrigatorio')}
                  className="rounded"
                />
                <label className="text-sm">Documento obrigatório</label>
              </div>
              <FormTextarea
                name="observacao"
                label="Observação"
                placeholder="Observações sobre o documento"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  Adicionar
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
