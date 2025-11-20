import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect, SelectOption } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { useClientesSelect } from "@/hooks/useClientesSelect";
import { useBancosSelect } from "@/hooks/useBancosSelect";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

// Schema base com tipos corrigidos
const baseSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  tipo_proposta: z.enum(["credito_pessoal", "consorcio", "cartao_credito"], {
    required_error: "Tipo de proposta é obrigatório",
  }),
  produto_id: z.string().min(1, "Produto é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  promotora_id: z.string().optional(),
  status: z.string().default("em_analise"),
  observacoes: z.string().optional(),
});

// Schemas dinâmicos por tipo
const creditoSchema = z.object({
  tipo_operacao: z.enum(["novo", "refinanciamento", "portabilidade"], {
    required_error: "Tipo de operação é obrigatório",
  }),
  valor_solicitado: z.number().min(0.01, "Valor solicitado deve ser maior que zero"),
  valor_parcela: z.number().min(0.01, "Valor da parcela deve ser maior que zero"),
  prazo_meses: z.number().int().min(1, "Prazo deve ser no mínimo 1 mês").max(360, "Prazo máximo é 360 meses"),
  taxa_juros: z.number().min(0, "Taxa de juros não pode ser negativa").max(100, "Taxa máxima é 100%"),
});

const consorcioSchema = z.object({
  valor_credito: z.number().min(0.01, "Valor do crédito deve ser maior que zero"),
  valor_bem: z.number().min(0.01, "Valor do bem deve ser maior que zero"),
  prazo_meses: z.number().int().min(1, "Prazo deve ser no mínimo 1 mês").max(360, "Prazo máximo é 360 meses"),
  taxa_administracao: z.number().min(0, "Taxa não pode ser negativa").max(100, "Taxa máxima é 100%"),
});

const cartaoSchema = z.object({
  limite_desejado: z.number().min(0.01, "Limite desejado deve ser maior que zero"),
});

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PropostaFormDynamicProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PropostaFormDynamic({ onSuccess, onCancel }: PropostaFormDynamicProps) {
  const navigate = useNavigate();
  const { clientes, loading: loadingClientes } = useClientesSelect();
  const { bancos, loading: loadingBancos } = useBancosSelect();

  // Estados
  const [produtos, setProdutos] = useState<SelectOption[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [promotoras, setPromotoras] = useState<SelectOption[]>([]);
  const [loadingPromotoras, setLoadingPromotoras] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentSchema, setCurrentSchema] = useState(baseSchema);

  // Form setup
  const methods = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      cliente_id: "",
      tipo_proposta: "credito_pessoal" as const,
      produto_id: "",
      banco_id: "",
      promotora_id: "",
      status: "em_analise",
      observacoes: "",
    },
  });

  const { watch, setValue, reset } = methods;
  const tipoProposta = watch("tipo_proposta");

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Atualizar schema quando tipo_proposta mudar
  useEffect(() => {
    let newSchema = baseSchema;

    if (tipoProposta === "credito_pessoal") {
      newSchema = baseSchema.merge(creditoSchema);
    } else if (tipoProposta === "consorcio") {
      newSchema = baseSchema.merge(consorcioSchema);
    } else if (tipoProposta === "cartao_credito") {
      newSchema = baseSchema.merge(cartaoSchema);
    }

    setCurrentSchema(newSchema);
    setErrorMessage(""); // Limpar erros ao trocar tipo
  }, [tipoProposta]);

  // Carregar produtos quando tipo_proposta mudar
  useEffect(() => {
    if (tipoProposta) {
      loadProdutos(tipoProposta);
      setValue("produto_id", ""); // Resetar produto quando tipo mudar
    }
  }, [tipoProposta, setValue]);

  // Carregar promotoras na inicialização
  useEffect(() => {
    loadPromotoras();
  }, []);

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================================================

  /**
   * Carregar produtos filtrados por tipo
   * CORREÇÃO: Adicionado filtro .eq('tipo', tipo)
   */
  const loadProdutos = async (tipo: string) => {
    setLoadingProdutos(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, tipo, tipo_credito")
        .eq("ativo", true)
        .eq("tipo", tipo) // ✅ FILTRO CORRIGIDO
        .order("nome", { ascending: true });

      if (error) throw error;

      const mappedProdutos = (data || [])
        .filter((produto) => produto.id && produto.nome)
        .map((produto) => ({
          value: produto.id,
          label: produto.tipo_credito ? `${produto.nome} - ${produto.tipo_credito}` : produto.nome,
        }));

      setProdutos(mappedProdutos);

      if (mappedProdutos.length === 0) {
        setErrorMessage(`Nenhum produto ativo encontrado para o tipo selecionado.`);
      }
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
      setErrorMessage("Não foi possível carregar a lista de produtos. Tente novamente.");
    } finally {
      setLoadingProdutos(false);
    }
  };

  /**
   * Carregar promotoras ativas
   */
  const loadPromotoras = async () => {
    setLoadingPromotoras(true);

    try {
      const { data, error } = await supabase
        .from("promotoras")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) {
        // Silencioso se tabela não existir (opcional)
        console.warn("Tabela promotoras não encontrada ou erro:", error.message);
        return;
      }

      const mappedPromotoras = (data || []).map((p) => ({
        value: p.id,
        label: p.nome,
      }));

      setPromotoras(mappedPromotoras);
    } catch (error: any) {
      console.warn("Erro ao carregar promotoras:", error.message);
    } finally {
      setLoadingPromotoras(false);
    }
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Validar autenticação
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Você precisa estar autenticado para criar uma proposta.");
      }

      // 2. Buscar empresa_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("empresa_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Não foi possível identificar sua empresa. Entre em contato com o suporte.");
      }

      // 3. Preparar detalhes baseado no tipo
      let detalhes: any = {};
      let valor = 0;

      if (data.tipo_proposta === "credito_pessoal") {
        detalhes = {
          tipo_operacao: data.tipo_operacao,
          valor_solicitado: data.valor_solicitado,
          valor_parcela: data.valor_parcela,
          prazo_meses: data.prazo_meses,
          taxa_juros: data.taxa_juros,
        };
        valor = data.valor_solicitado;
      } else if (data.tipo_proposta === "consorcio") {
        detalhes = {
          valor_credito: data.valor_credito,
          valor_bem: data.valor_bem,
          prazo_meses: data.prazo_meses,
          taxa_administracao: data.taxa_administracao,
        };
        valor = data.valor_credito;
      } else if (data.tipo_proposta === "cartao_credito") {
        detalhes = {
          limite_desejado: data.limite_desejado,
        };
        valor = data.limite_desejado;
      }

      // 4. Inserir proposta
      const { data: novaProposta, error: propostaError } = await supabase
        .from("propostas")
        .insert({
          cliente_id: data.cliente_id,
          tipo_proposta: data.tipo_proposta,
          produto_id: data.produto_id,
          banco_id: data.banco_id,
          promotora_id: data.promotora_id || null,
          status: data.status,
          observacoes: data.observacoes || null,
          detalhes_produto: detalhes,
          valor: valor,
          empresa_id: profile.empresa_id,
          usuario_id: user.id,
        })
        .select()
        .single();

      if (propostaError) {
        console.error("Erro ao inserir proposta:", propostaError);
        throw new Error("Erro ao criar proposta. Verifique os dados e tente novamente.");
      }

      // 5. Inserir histórico de criação
      const { error: historicoError } = await supabase.from("proposta_historico").insert({
        proposta_id: novaProposta.id,
        status_novo: data.status,
        status_anterior: null,
        acao: "criacao",
        empresa_id: profile.empresa_id,
        usuario_id: user.id,
      });

      if (historicoError) {
        console.warn("Erro ao criar histórico:", historicoError);
        // Não bloqueia a criação da proposta
      }

      // 6. Criar checklist inicial de documentos
      const documentosIniciais = [
        { nome: "RG/CNH", obrigatorio: true },
        { nome: "CPF", obrigatorio: true },
        { nome: "Comprovante de Residência", obrigatorio: true },
        { nome: "Comprovante de Renda", obrigatorio: true },
      ];

      const documentosParaInserir = documentosIniciais.map((doc) => ({
        proposta_id: novaProposta.id,
        nome_documento: doc.nome,
        obrigatorio: doc.obrigatorio,
        status_documento: "pendente",
        empresa_id: profile.empresa_id,
        usuario_id: user.id,
      }));

      const { error: documentosError } = await supabase.from("proposta_documentos").insert(documentosParaInserir);

      if (documentosError) {
        console.warn("Erro ao criar checklist de documentos:", documentosError);
        // Não bloqueia a criação da proposta
      }

      // 7. Feedback e redirecionamento
      toast.success("✅ Proposta criada com sucesso!");

      if (onSuccess) onSuccess();

      // Redirecionar após pequeno delay para garantir que toast seja visto
      setTimeout(() => {
        navigate(`/propostas/${novaProposta.id}`);
      }, 500);
    } catch (error: any) {
      console.error("Erro ao criar proposta:", error);
      const errorMsg = error.message || "Erro desconhecido ao criar proposta";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // OPÇÕES DE SELECT
  // ============================================================================

  const tipoPropostaOptions: SelectOption[] = [
    { value: "credito_pessoal", label: "Crédito Pessoal" },
    { value: "consorcio", label: "Consórcio" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
  ];

  const statusOptions: SelectOption[] = [
    { value: "em_analise", label: "Em Análise" },
    { value: "aprovada", label: "Aprovada" },
    { value: "reprovada", label: "Reprovada" },
    { value: "pendente", label: "Pendente" },
  ];

  const tipoOperacaoOptions: SelectOption[] = [
    { value: "novo", label: "Novo" },
    { value: "refinanciamento", label: "Refinanciamento" },
    { value: "portabilidade", label: "Portabilidade" },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* Mensagem de erro global */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="cliente_id"
                label="Cliente *"
                placeholder={loadingClientes ? "Carregando..." : "Selecione o cliente"}
                options={clientes}
                disabled={loadingClientes || submitting}
              />

              <FormSelect
                name="tipo_proposta"
                label="Tipo de Proposta *"
                placeholder="Selecione o tipo"
                options={tipoPropostaOptions}
                disabled={submitting}
              />

              <FormSelect
                name="produto_id"
                label="Produto *"
                placeholder={loadingProdutos ? "Carregando..." : "Selecione o produto"}
                options={produtos}
                disabled={loadingProdutos || !tipoProposta || submitting}
                helperText={!tipoProposta ? "Selecione o tipo de proposta primeiro" : ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 2: DETALHES DA OPERAÇÃO (DINÂMICO) */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tipoProposta === "credito_pessoal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  name="tipo_operacao"
                  label="Tipo de Operação *"
                  placeholder="Selecione o tipo"
                  options={tipoOperacaoOptions}
                  disabled={submitting}
                />

                <FormInput
                  name="valor_solicitado"
                  label="Valor Solicitado (R$) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("valor_solicitado", value, { shouldValidate: true });
                  }}
                />

                <FormInput
                  name="valor_parcela"
                  label="Valor da Parcela (R$) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("valor_parcela", value, { shouldValidate: true });
                  }}
                />

                <FormInput
                  name="prazo_meses"
                  label="Prazo (meses) *"
                  type="number"
                  min="1"
                  max="360"
                  placeholder="12"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setValue("prazo_meses", value, { shouldValidate: true });
                  }}
                />

                <FormInput
                  name="taxa_juros"
                  label="Taxa de Juros (% a.m.) *"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="1.99"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("taxa_juros", value, { shouldValidate: true });
                  }}
                />
              </div>
            )}

            {tipoProposta === "consorcio" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="valor_credito"
                  label="Valor do Crédito (R$) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("valor_credito", value, { shouldValidate: true });
                  }}
                />

                <FormInput
                  name="valor_bem"
                  label="Valor do Bem (R$) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("valor_bem", value, { shouldValidate: true });
                  }}
                />

                <FormInput
                  name="prazo_meses"
                  label="Prazo (meses) *"
                  type="number"
                  min="1"
                  max="360"
                  placeholder="120"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setValue("prazo_meses", value, { shouldValidate: true });
                  }}
                />

                <FormInput
                  name="taxa_administracao"
                  label="Taxa de Administração (%) *"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.20"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("taxa_administracao", value, { shouldValidate: true });
                  }}
                />
              </div>
            )}

            {tipoProposta === "cartao_credito" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="limite_desejado"
                  label="Limite Desejado (R$) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue("limite_desejado", value, { shouldValidate: true });
                  }}
                />
              </div>
            )}

            {!tipoProposta && (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um tipo de proposta para ver os campos específicos
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEÇÃO 3: FINALIZAÇÃO */}
        <Card>
          <CardHeader>
            <CardTitle>Finalização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="banco_id"
                label="Banco *"
                placeholder={loadingBancos ? "Carregando..." : "Selecione o banco"}
                options={bancos}
                disabled={loadingBancos || submitting}
              />

              <FormSelect
                name="promotora_id"
                label="Promotora (Opcional)"
                placeholder={loadingPromotoras ? "Carregando..." : "Selecione a promotora"}
                options={promotoras}
                disabled={loadingPromotoras || submitting}
              />

              <FormSelect
                name="status"
                label="Status Inicial *"
                placeholder="Selecione o status"
                options={statusOptions}
                disabled={submitting}
              />
            </div>

            <FormTextarea
              name="observacoes"
              label="Observações"
              placeholder="Observações adicionais sobre a proposta..."
              rows={4}
              disabled={submitting}
            />
          </CardContent>
        </Card>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm("Deseja cancelar? Os dados preenchidos serão perdidos.")) {
                reset();
                if (onCancel) onCancel();
              }
            }}
            disabled={submitting}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={submitting || loadingClientes || loadingBancos || loadingProdutos}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Salvando..." : "Criar Proposta"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
