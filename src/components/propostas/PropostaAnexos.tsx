import { useEffect, useState, useRef } from 'react';
import { usePropostaAnexos, PropostaAnexo } from '@/hooks/usePropostaAnexos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Download, Trash2, FileText, File } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PropostaAnexosProps {
  propostaId: string;
}

export function PropostaAnexos({ propostaId }: PropostaAnexosProps) {
  const { loading, uploading, fetchAnexos, uploadAnexo, downloadAnexo, deleteAnexo } = usePropostaAnexos();
  const [anexos, setAnexos] = useState<PropostaAnexo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAnexos();
  }, [propostaId]);

  const loadAnexos = async () => {
    const data = await fetchAnexos(propostaId);
    setAnexos(data);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const success = await uploadAnexo(propostaId, file);
      if (success) loadAnexos();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (anexo: PropostaAnexo) => {
    if (confirm('Deseja realmente remover este arquivo?')) {
      const success = await deleteAnexo(anexo);
      if (success) loadAnexos();
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (tipo: string | null) => {
    if (!tipo) return <File className="h-8 w-8 text-muted-foreground" />;
    if (tipo.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (tipo.includes('image')) return <File className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  if (loading && anexos.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Anexos</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Upload Arquivo'}
          </Button>
        </div>
      </div>

      {anexos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum arquivo anexado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anexos.map((anexo) => (
            <Card key={anexo.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getFileIcon(anexo.tipo_arquivo)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{anexo.nome_arquivo}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(anexo.tamanho_bytes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {anexo.usuario_nome} • {formatDistanceToNow(new Date(anexo.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadAnexo(anexo)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(anexo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
