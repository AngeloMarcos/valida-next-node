import { useState, useEffect } from 'react';
import { CadastrosLayout } from '@/components/CadastrosLayout';
import { CadastroEmptyState } from '@/components/CadastroEmptyState';
import { usePromotoras } from '@/hooks/usePromotoras';
import { Building2 } from 'lucide-react';

export default function Promotoras() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { promotoras, loading, fetchPromotoras } = usePromotoras();

  const loadPromotoras = () => {
    fetchPromotoras(searchTerm);
  };

  useEffect(() => {
    loadPromotoras();
  }, [searchTerm]);

  return (
    <CadastrosLayout
      titulo="Promotoras"
      descricao="Gerencie as promotoras de crédito"
      botaoNovoLabel="Nova Promotora"
      onNovoClick={() => setShowModal(true)}
      isLoading={loading && promotoras.length === 0}
    >
      {promotoras.length === 0 && !loading ? (
        <CadastroEmptyState
          titulo="Nenhuma promotora cadastrada"
          descricao="Comece cadastrando sua primeira promotora de crédito para gerenciar as operações."
          botaoLabel="Cadastrar Primeira Promotora"
          onNovoClick={() => setShowModal(true)}
          icone={<Building2 className="h-12 w-12" />}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lista de promotoras - total: {promotoras.length}</p>
        </div>
      )}
    </CadastrosLayout>
  );
}
