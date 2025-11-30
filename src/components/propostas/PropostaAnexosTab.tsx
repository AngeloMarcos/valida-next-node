import { useState, useEffect, useRef } from 'react';
import { usePropostaDocumentos, PropostaDocumento } from '@/hooks/usePropostaDocumentos';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Eye, 
  Check, 
  X, 
  Loader2,
  AlertCircle,
  Download
} from 'lucide-react';
import { LoadingSpinner } from '@/components/shared';
import { format } from 'date-fns';

interface PropostaAnexosTabProps {
  propostaId: string;
  produtoId?: string | null;
}

export function PropostaAnexosTab({ propostaId }: PropostaAnexosTabProps) {
  const [documentos, setDocumentos] = useState<PropostaDocumento[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [newDocObrigatorio, setNewDocObrigatorio] = useState(true);
  const [openNewDoc, setOpenNewDoc] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const { loading, fetchDocumentos, createDocumento, updateDocumento } = usePropostaDocumentos();
  const { profile, isAdmin, isSupervisor } = useAuth();

  useEffect(() => {
    loadDocumentos();
  }, [propostaId]);

  const loadDocumentos = async () => {
    const data = await fetchDocumentos(propostaId);
    setDocumentos(data);
  };

  const progress = documentos.length > 0
    ? Math.round(
        (documentos.filter(d => d.status_documento === 'aprovado').length / 
        documentos.filter(d => d.obrigatorio).length) * 100
      )
    : 0;

  const handleAddDocumento = async () => {
    if (!newDocName.trim()) {
      toast.error('Digite o nome do documento');
      return;
    }

    await createDocumento(propostaId, {
      nome_documento: newDocName,
      obrigatorio: newDocObrigatorio,
      status_documento: 'pendente'
    });

    setNewDocName('');
    setNewDocObrigatorio(true);
    setOpenNewDoc(false);
    loadDocumentos();
  };

  const handleFileSelect = async (doc: PropostaDocumento, file: File) => {
    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    // Validar extensão
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, JPG ou PNG');
      return;
    }

    setUploading(doc.id);

    try {
      // Upload para Storage
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${doc.id}_${timestamp}.${fileExt}`;
      const filePath = `${profile?.empresa_id}/propostas/${propostaId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proposta-anexos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('proposta-anexos')
        .getPublicUrl(filePath);

      // Atualizar documento
      await updateDocumento(doc.id, {
        status_documento: 'enviado',
        data_recebimento: new Date().toISOString()
      });

      // Log no histórico
      await supabase.from('proposta_historico').insert({
        proposta_id: propostaId,
        status_anterior: null,
        status_novo: 'documento_enviado',
        observacao: `Documento "${doc.nome_documento}" enviado`,
        usuario_id: profile?.id,
        empresa_id: profile?.empresa_id
      });

      toast.success('Documento enviado com sucesso!');
      loadDocumentos();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleAprovar = async (doc: PropostaDocumento) => {
    await updateDocumento(doc.id, {
      status_documento: 'aprovado'
    });

    // Log no histórico
    await supabase.from('proposta_historico').insert({
      proposta_id: propostaId,
      status_anterior: null,
      status_novo: 'documento_aprovado',
      observacao: `Documento "${doc.nome_documento}" aprovado`,
      usuario_id: profile?.id,
      empresa_id: profile?.empresa_id
    });

    loadDocumentos();

    // Verificar se todos docs obrigatórios foram aprovados
    const allDocs = await fetchDocumentos(propostaId);
    const allObrigatoriosAprovados = allDocs
      .filter(d => d.obrigatorio)
      .every(d => d.status_documento === 'aprovado');

    if (allObrigatoriosAprovados) {
      toast.success('🎉 Todos os documentos obrigatórios foram aprovados!');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: { variant: 'secondary', label: 'Pendente' },
      enviado: { variant: 'outline', label: 'Enviado' },
      aprovado: { variant: 'default', label: 'Aprovado' }
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Progresso da Documentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Documentos obrigatórios aprovados</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Adicionar Documento */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Checklist de Documentos</h3>
        {(isAdmin || isSupervisor) && (
          <Dialog open={openNewDoc} onOpenChange={setOpenNewDoc}>
            <DialogTrigger asChild>
              <Button size="sm">+ Adicionar Documento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Documento ao Checklist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Documento</Label>
                  <Input
                    id="nome"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="Ex: RG do Cliente"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="obrigatorio"
                    checked={newDocObrigatorio}
                    onChange={(e) => setNewDocObrigatorio(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="obrigatorio" className="cursor-pointer">
                    Documento obrigatório
                  </Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpenNewDoc(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddDocumento}>
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de Documentos */}
      {documentos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum documento cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documentos
            .sort((a, b) => {
              if (a.obrigatorio && !b.obrigatorio) return -1;
              if (!a.obrigatorio && b.obrigatorio) return 1;
              return a.nome_documento.localeCompare(b.nome_documento);
            })
            .map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Ícone e Nome */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-md ${
                        doc.status_documento === 'aprovado' 
                          ? 'bg-green-500/10 text-green-500' 
                          : doc.status_documento === 'enviado'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {doc.status_documento === 'aprovado' ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{doc.nome_documento}</p>
                          {doc.obrigatorio && (
                            <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                          )}
                        </div>
                        {doc.data_recebimento && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Enviado em {format(new Date(doc.data_recebimento), 'dd/MM/yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(doc.status_documento)}
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      {doc.status_documento === 'pendente' && (
                        <>
                          <input
                            ref={(el) => (fileInputRefs.current[doc.id] = el)}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(doc, file);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            disabled={uploading === doc.id}
                            className="w-full sm:w-auto min-h-10"
                          >
                            {uploading === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span className="ml-2">Upload</span>
                          </Button>
                        </>
                      )}

                      {doc.status_documento !== 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto min-h-10"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="ml-2">Ver</span>
                        </Button>
                      )}

                      {doc.status_documento === 'enviado' && (isAdmin || isSupervisor) && (
                        <Button
                          size="sm"
                          onClick={() => handleAprovar(doc)}
                          className="w-full sm:w-auto min-h-10"
                        >
                          <Check className="h-4 w-4" />
                          <span className="ml-2">Aprovar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
