import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

interface BankSelectorProps {
  supportedBanks: string[];
  selectedBank: string | null;
  onSelectBank: (bank: string) => void;
  onLoadBanks: () => void;
  isLoading: boolean;
}

const bankLabels: Record<string, string> = {
  bradesco: 'Bradesco',
  itau: 'Itaú',
  bb: 'Banco do Brasil',
  santander: 'Santander',
  caixa: 'Caixa Econômica',
};

export function BankSelector({
  supportedBanks,
  selectedBank,
  onSelectBank,
  onLoadBanks,
  isLoading,
}: BankSelectorProps) {
  useEffect(() => {
    if (supportedBanks.length === 0) {
      onLoadBanks();
    }
  }, [supportedBanks.length, onLoadBanks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Selecionar Banco
        </CardTitle>
        <CardDescription>
          Escolha o banco para enviar a proposta para análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedBank || ''}
          onValueChange={onSelectBank}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um banco..." />
          </SelectTrigger>
          <SelectContent>
            {supportedBanks.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bankLabels[bank] || bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
