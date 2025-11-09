import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Package, Building2, ArrowRight } from "lucide-react";
import { api, Product, Bank } from "@/lib/api";
import { toast } from "sonner";

const productTypeLabels = {
  credit: "Crédito Pessoal",
  consortium: "Consórcio",
  financing: "Financiamento",
};

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    type: "credit" as Product["type"],
    bank_id: "",
    min_amount: "",
    max_amount: "",
    min_installments: "",
    max_installments: "",
    interest_rate: "",
    description: "",
    is_active: true,
  });

  const loadData = async () => {
    try {
      const [productsData, banksData] = await Promise.all([
        api.getProducts(),
        api.getBanks(),
      ]);
      setProducts(productsData);
      setBanks(banksData.filter(b => b.is_active));
      setFilteredProducts(productsData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (activeTab !== "all") {
      filtered = filtered.filter(p => p.type === activeTab);
    }

    if (bankFilter !== "all") {
      filtered = filtered.filter(p => p.bank_id === bankFilter);
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "true";
      filtered = filtered.filter(p => p.is_active === isActive);
    }

    setFilteredProducts(filtered);
  }, [activeTab, bankFilter, statusFilter, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      const productData = {
        ...formData,
        min_amount: parseFloat(formData.min_amount),
        max_amount: parseFloat(formData.max_amount),
        min_installments: parseInt(formData.min_installments),
        max_installments: parseInt(formData.max_installments),
        interest_rate: parseFloat(formData.interest_rate),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await api.createProduct(productData);
        toast.success("Produto cadastrado com sucesso!");
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
    setFormData({
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
      await api.updateProduct(product.id, { is_active: !product.is_active });
      toast.success(`Produto ${!product.is_active ? 'ativado' : 'desativado'} com sucesso!`);
      loadData();
    } catch (error) {
      toast.error("Erro ao alterar status do produto");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await api.deleteProduct(id);
        toast.success("Produto excluído com sucesso!");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir produto");
      }
    }
  };

  const resetForm = () => {
    setFormData({
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Produtos Financeiros</h2>
            <p className="text-muted-foreground">
              Gerencie os produtos financeiros disponíveis
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                  <DialogDescription>
                    Passo {currentStep} de 3
                  </DialogDescription>
                </DialogHeader>
                
                {currentStep === 1 && (
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Crédito Pessoal Premium"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Produto *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as Product["type"] })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Crédito Pessoal</SelectItem>
                          <SelectItem value="consortium">Consórcio</SelectItem>
                          <SelectItem value="financing">Financiamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_id">Banco *</Label>
                      <Select
                        value={formData.bank_id}
                        onValueChange={(value) => setFormData({ ...formData, bank_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um banco" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_amount">Valor Mínimo *</Label>
                        <Input
                          id="min_amount"
                          type="number"
                          step="0.01"
                          placeholder="R$ 0,00"
                          value={formData.min_amount}
                          onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_amount">Valor Máximo *</Label>
                        <Input
                          id="max_amount"
                          type="number"
                          step="0.01"
                          placeholder="R$ 0,00"
                          value={formData.max_amount}
                          onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_installments">Mínimo de Parcelas *</Label>
                        <Input
                          id="min_installments"
                          type="number"
                          min="1"
                          value={formData.min_installments}
                          onChange={(e) => setFormData({ ...formData, min_installments: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_installments">Máximo de Parcelas *</Label>
                        <Input
                          id="max_installments"
                          type="number"
                          value={formData.max_installments}
                          onChange={(e) => setFormData({ ...formData, max_installments: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest_rate">Taxa de Juros Mensal (%) *</Label>
                      <Input
                        id="interest_rate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.interest_rate}
                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição Detalhada</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        placeholder="Descreva as características do produto..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active" className="text-sm text-muted-foreground">
                        Produto Ativo (produtos inativos não aparecem no simulador)
                      </Label>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      Voltar
                    </Button>
                  )}
                  <Button type="submit">
                    {currentStep < 3 ? (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bancos</SelectItem>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
            <TabsTrigger value="credit">Crédito Pessoal</TabsTrigger>
            <TabsTrigger value="consortium">Consórcio</TabsTrigger>
            <TabsTrigger value="financing">Financiamento</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="relative">
                    <Badge className="absolute top-4 right-4" variant="outline">
                      {productTypeLabels[product.type]}
                    </Badge>
                    <CardHeader>
                      <CardTitle className="pr-24">{product.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {product.bank_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(product.min_amount)} - {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(product.max_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parcelas</span>
                        <span className="font-medium">
                          {product.min_installments}x - {product.max_installments}x
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa</span>
                        <span className="font-medium">{product.interest_rate}% a.m.</span>
                      </div>
                      <div className="pt-2">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(product)}
                      >
                        <Switch checked={product.is_active} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
