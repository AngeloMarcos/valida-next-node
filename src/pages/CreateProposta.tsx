import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect, SelectOption } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { useClientesSelect } from "@/hooks/useClientesSelect";
import { useBancosSelect } from "@/hooks/useBancosSelect";
import { useProdutosSelect } from "@/hooks/useProdutosSelect";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/DashboardLayout";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const baseSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  tipo_proposta: z.enum(["credito", "consorcio", "seguro"], {
    required_error: "Tipo de proposta é obrigatório",
  }),
  produto_id: z.string().min(1, "Produto é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  status: z.string().default("em_analise"),
  observacoes: z.string().optional(),
});

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

const seguroSchema = z.object({
  tipo_seguro: z.string().min(1, "Tipo de seguro é obrigatório"),
  valor_premio: z.number().min(0.01, "Valor do prêmio deve ser maior que zero"),
  valor_cobertura: z.number().min(0.01, "Valor de cobertura deve ser maior que zero"),
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CreateProposta() {
  const navigate = useNavigate();
  const { clientes, loading: loadingClientes } = useClientesSelect();
  const { bancos, loading: loadingBancos } = useBancosSelect();
  const [produtos, setProdutos] = useState<SelectOption[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentSchema, setCurrentSchema] = useState(baseSchema);

  const methods = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      cliente_id: "",
      tipo_proposta: "credito" as const,
      produto_id: "",
      banco_id: "",
      status: "em_analise",
      observacoes: "",
    },
  });

  const { watch, reset } = methods;
  const tipoProposta = watch("tipo_proposta");
  const bancoId = watch("banco_id");

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    let newSchema = baseSchema;

    if (tipoProposta === "credito") {
      newSchema = baseSchema.merge(creditoSchema);
    } else if (tipoProposta === "consorcio") {
      newSchema = baseSchema.merge(consorcioSchema);
    } else if (tipoProposta === "seguro") {
      newSchema = baseSchema.merge(seguroSchema);
    }

    setCurrentSchema(newSchema);
    setErrorMessage("");
  }, [tipoProposta]);

  // Filtrar produtos por banco selecionado
  useEffect(() => {
    if (bancoId) {
      fetchProdutosByBanco(bancoId);
    } else {
      setProdutos([]);
    }
  }, [bancoId]);

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================================================

  const fetchProdutosByBanco = async (bancoId: string) => {
    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, tipo_credito')
        .eq('banco_id', bancoId)
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      if (error) throw error;

      const mappedProdutos = (data || [])
        .filter(produto => produto.id && produto.nome)
        .map(produto => ({
          value: produto.id,
          label: produto.tipo_credito ? `${produto.nome} - ${produto.tipo_credito}` : produto.nome,
        }));

      setProdutos(mappedProdutos);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
      setProdutos([]);
    } finally {
      setLoadingProdutos(false);
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

      if (data.tipo_proposta === "credito") {
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
      } else if (data.tipo_proposta === "seguro") {
        detalhes = {
          tipo_seguro: data.tipo_seguro,
          valor_premio: data.valor_premio,
          valor_cobertura: data.valor_cobertura,
        };
        valor = data.valor_premio;
      }

      // 4. Inserir proposta
      const { data: novaProposta, error: propostaError } = await supabase
        .from("propostas")
        .insert({
          cliente_id: data.cliente_id,
          tipo_proposta: data.tipo_proposta,
          produto_id: data.produto_id,
          banco_id: data.banco_id,
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
      await supabase.from("proposta_historico").insert({
        proposta_id: novaProposta.id,
        status_novo: data.status,
        status_anterior: null,
        empresa_id: profile.empresa_id,
        usuario_id: user.id,
      });

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

      await supabase.from("proposta_documentos").insert(documentosParaInserir);

      // 7. Feedback e redirecionamento
      toast.success("✅ Proposta criada com sucesso!");
      navigate(`/propostas/${novaProposta.id}`);
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
    { value: "credito", label: "Crédito Pessoal" },
    { value: "consorcio", label: "Consórcio" },
    { value: "seguro", label: "Seguro" },
  ];

  const statusOptions: SelectOption[] = [
    { value: "em_analise", label: "Em Análise" },
    { value: "doc_pendente", label: "Documentos Pendentes" },
    { value: "em_processamento", label: "Em Processamento" },
    { value: "aprovada", label: "Aprovada" },
  ];

  const tipoOperacaoOptions: SelectOption[] = [
    { value: "novo", label: "Novo" },
    { value: "refinanciamento", label: "Refinanciamento" },
    { value: "portabilidade", label: "Portabilidade" },
  ];

  const tipoSeguroOptions: SelectOption[] = [
    { value: "vida", label: "Seguro de Vida" },
    { value: "auto", label: "Seguro Auto" },
    { value: "residencial", label: "Seguro Residencial" },
    { value: "empresarial", label: "Seguro Empresarial" },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/propostas")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Proposta</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo para criar uma nova proposta</p>
          </div>
        </div>

        <Separator className="mb-6" />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* SEÇÃO A: CABEÇALHO */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <div>
                    <CardTitle>Seção A - Dados Principais</CardTitle>
                    <CardDescription>Informações básicas da proposta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    name="banco_id"
                    label="Banco *"
                    placeholder={loadingBancos ? "Carregando..." : "Selecione o banco"}
                    options={bancos}
                    disabled={loadingBancos || submitting}
                    helperText="Selecione o banco primeiro"
                  />
                </div>

                <FormSelect
                  name="produto_id"
                  label="Produto *"
                  placeholder={
                    !bancoId
                      ? "Selecione um banco primeiro"
                      : loadingProdutos
                      ? "Carregando..."
                      : "Selecione o produto"
                  }
                  options={produtos}
                  disabled={!bancoId || loadingProdutos || submitting}
                  helperText={!bancoId ? "O produto será filtrado pelo banco selecionado" : undefined}
                />
              </CardContent>
            </Card>

            {/* SEÇÃO B: DETALHES DA OPERAÇÃO (DINÂMICA) */}
            <Card className="border-accent/20 shadow-sm">
              <CardHeader className="bg-accent/5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-accent rounded-full" />
                  <div>
                    <CardTitle>Seção B - Detalhes da Operação</CardTitle>
                    <CardDescription>Campos específicos do tipo de proposta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {tipoProposta === "credito" && (
                  <div className="space-y-4">
                    <FormSelect
                      name="tipo_operacao"
                      label="Tipo de Operação *"
                      placeholder="Selecione o tipo"
                      options={tipoOperacaoOptions}
                      disabled={submitting}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        name="valor_solicitado"
                        label="Valor Solicitado (R$) *"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        disabled={submitting}
                        valueAsNumber
                        helperText="Valor total solicitado pelo cliente"
                      />

                      <FormInput
                        name="valor_parcela"
                        label="Valor da Parcela (R$) *"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        disabled={submitting}
                        valueAsNumber
                        helperText="Valor estimado de cada parcela"
                      />

                      <FormInput
                        name="prazo_meses"
                        label="Prazo (meses) *"
                        type="number"
                        min="1"
                        max="360"
                        placeholder="12"
                        disabled={submitting}
                        valueAsNumber
                        helperText="Prazo total em meses"
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
                        valueAsNumber
                        helperText="Taxa de juros ao mês"
                      />
                    </div>
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
                      valueAsNumber
                      helperText="Valor total do crédito"
                    />

                    <FormInput
                      name="valor_bem"
                      label="Valor do Bem (R$) *"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      disabled={submitting}
                      valueAsNumber
                      helperText="Valor do bem a ser adquirido"
                    />

                    <FormInput
                      name="prazo_meses"
                      label="Prazo (meses) *"
                      type="number"
                      min="1"
                      max="360"
                      placeholder="120"
                      disabled={submitting}
                      valueAsNumber
                      helperText="Prazo do consórcio"
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
                      valueAsNumber
                      helperText="Taxa administrativa do consórcio"
                    />
                  </div>
                )}

                {tipoProposta === "seguro" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      name="tipo_seguro"
                      label="Tipo de Seguro *"
                      placeholder="Selecione o tipo"
                      options={tipoSeguroOptions}
                      disabled={submitting}
                    />

                    <FormInput
                      name="valor_premio"
                      label="Valor do Prêmio (R$) *"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      disabled={submitting}
                      valueAsNumber
                      helperText="Valor do prêmio mensal ou anual"
                    />

                    <FormInput
                      name="valor_cobertura"
                      label="Valor de Cobertura (R$) *"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      disabled={submitting}
                      valueAsNumber
                      helperText="Valor total da cobertura"
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

            {/* SEÇÃO C: FINALIZAÇÃO */}
            <Card className="border-secondary/20 shadow-sm">
              <CardHeader className="bg-secondary/5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-secondary rounded-full" />
                  <div>
                    <CardTitle>Seção C - Finalização</CardTitle>
                    <CardDescription>Informações complementares e status inicial</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FormSelect
                  name="status"
                  label="Status Inicial *"
                  placeholder="Selecione o status"
                  options={statusOptions}
                  disabled={submitting}
                  helperText="Status padrão: Em Análise"
                />

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
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm("Deseja cancelar? Os dados preenchidos serão perdidos.")) {
                    navigate("/propostas");
                  }
                }}
                disabled={submitting}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Proposta"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
}
