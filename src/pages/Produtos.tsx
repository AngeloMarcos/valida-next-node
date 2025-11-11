import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, Power } from "lucide-react";
import { api, Product, Bank } from "@/lib/api";
import { toast } from "sonner";
import { FormInput, FormSelect, FormTextarea, FormSwitch } from "@/components/form";

const productTypeLabels = {
  credit: "Crédito Pessoal",
  consortium: "Consórcio",
  financing: "Financiamento",
};

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  type: z.enum(["credit", "consortium", "financing"]),
  bank_id: z.string().min(1, "Banco é obrigatório"),
  min_amount: z.string().min(1, "Valor mínimo é obrigatório"),
  max_amount: z.string().min(1, "Valor máximo é obrigatório"),
  min_installments: z.string().min(1, "Mínimo de parcelas é obrigatório"),
  max_installments: z.string().min(1, "Máximo de parcelas é obrigatório"),
  interest_rate: z.string().min(1, "Taxa de juros é obrigatória"),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      type: "credit",
      bank_id: "",
      min_amount: "",
      max_amount: "",
      min_installments: "",
      max_installments: "",
      interest_rate: "",
      description: "",
      is_active: true,
    },
  });

  const loadData = async () => {
    try {
      const [productsData, banksData] = await Promise.all([
        api.getProducts(),
        api.getBanks(),
      ]);
      setProducts(productsData);
      setBanks(banksData.filter((b) => b.is_active));
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    return product.type === activeTab;
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        name: data.name,
        type: data.type,
        bank_id: data.bank_id,
        min_amount: parseFloat(data.min_amount),
        max_amount: parseFloat(data.max_amount),
        min_installments: parseInt(data.min_installments),
        max_installments: parseInt(data.max_installments),
        interest_rate: parseFloat(data.interest_rate),
        description: data.description,
        is_active: data.is_active,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await api.createProduct(productData);
        toast.success("Produto criado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      type: product.type,
      bank_id: product.bank_id,
      min_amount: product.min_amount.toString(),
      max_amount: product.max_amount.toString(),
      min_installments: product.min_installments.toString(),
      max_installments: product.max_installments.toString(),
      interest_rate: product.interest_rate.toString(),
      description: product.description || "",
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await api.updateProduct(product.id, {
        ...product,
        is_active: !product.is_active,
      });
      toast.success(
        `Produto ${!product.is_active ? "ativado" : "desativado"} com sucesso!`
      );
      loadData();
    } catch (error) {
      toast.error("Erro ao alterar status do produto");
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await api.deleteProduct(product.id);
        toast.success("Produto excluído com sucesso!");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir produto");
      }
    }
  };

  const resetForm = () => {
    form.reset({
      name: "",
      type: "credit",
      bank_id: "",
      min_amount: "",
      max_amount: "",
      min_installments: "",
      max_installments: "",
      interest_rate: "",
      description: "",
      is_active: true,
    });
    setEditingProduct(null);
    setCurrentStep(1);
  };

  const bankOptions = banks.map((bank) => ({
    value: bank.id,
    label: bank.name,
  }));

  const productTypeOptions = [
    { value: "credit", label: "Crédito Pessoal" },
    { value: "consortium", label: "Consórcio" },
    { value: "financing", label: "Financiamento" },
  ];

  const handleNextStep = async () => {
    const fieldsToValidate =
      currentStep === 1
        ? ["name", "type", "bank_id"]
        : ["min_amount", "max_amount", "min_installments", "max_installments", "interest_rate"];

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Produtos Financeiros</h2>
            <p className="text-muted-foreground">
              Gerencie os produtos disponíveis para propostas
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                  <DialogDescription>
                    Passo {currentStep} de 3
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  {currentStep === 1 && (
                    <div className="grid gap-4">
                      <FormInput
                        name="name"
                        label="Nome do Produto"
                        placeholder="Ex: Crédito Pessoal Premium"
                      />
                      <FormSelect
                        name="type"
                        label="Tipo de Produto"
                        options={productTypeOptions}
                      />
                      <FormSelect
                        name="bank_id"
                        label="Banco"
                        placeholder="Selecione um banco"
                        options={bankOptions}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          name="min_amount"
                          label="Valor Mínimo"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <FormInput
                          name="max_amount"
                          label="Valor Máximo"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          name="min_installments"
                          label="Mínimo de Parcelas"
                          type="number"
                          placeholder="1"
                        />
                        <FormInput
                          name="max_installments"
                          label="Máximo de Parcelas"
                          type="number"
                          placeholder="60"
                        />
                      </div>
                      <FormInput
                        name="interest_rate"
                        label="Taxa de Juros Mensal (%)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="grid gap-4">
                      <FormTextarea
                        name="description"
                        label="Descrição Detalhada"
                        rows={4}
                        placeholder="Descreva as características do produto..."
                      />
                      <FormSwitch
                        name="is_active"
                        label="Produto Ativo"
                        helperText="Produtos inativos não aparecem no simulador"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={handlePrevStep}>
                      Voltar
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button type="button" onClick={handleNextStep}>
                      Próximo
                    </Button>
                  ) : (
                    <Button type="submit">Salvar</Button>
                  )}
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
            <TabsTrigger value="credit">Crédito Pessoal</TabsTrigger>
            <TabsTrigger value="consortium">Consórcio</TabsTrigger>
            <TabsTrigger value="financing">Financiamento</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum produto encontrado
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {product.bank_name}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{productTypeLabels[product.type]}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.min_amount)}{" "}
                          -{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.max_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parcelas:</span>
                        <span className="font-medium">
                          {product.min_installments}x - {product.max_installments}x
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa:</span>
                        <span className="font-medium">{product.interest_rate}% a.m.</span>
                      </div>
                      <div className="pt-2">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(product)}
                      >
                        <Power className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
