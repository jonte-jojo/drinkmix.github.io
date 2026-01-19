import { useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { loadProducts, resetProductsToSeed } from '@/data/productsStore';

function uid() {
  return crypto?.randomUUID?.() ?? `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type Category = 'lemonade' | 'liquers' | 'Sockerlag';

export function AdminProducts({
  products,
  onChangeProducts,
  onClose,
  onSeeOrders,
}: {
  products: Product[];
  onChangeProducts: (next: Product[]) => void;
  onClose: () => void;
  onSeeOrders: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  const updateSelected = (patch: Partial<Product>) => {
    if (!selected) return;
    onChangeProducts(products.map((p) => (p.id === selected.id ? { ...p, ...patch } : p)));
  };

  const addProduct = () => {
    const caseSize = 24;
    const casePrice = 480;
    const unitPrice = Math.round((casePrice / caseSize) * 100) / 100;

    const p: Product = {
      id: uid(),
      name: 'New Product',
      description: '',
      unitPrice,
      casePrice,
      caseSize,
      unitLabel: 'st',
      unit: `${caseSize} st per flak`,
      category: 'lemonade',
      image: '/placeholder.svg',
      hasAlcohol: false,
    };

    const next = [p, ...products];
    onChangeProducts(next);
    setSelectedId(p.id);
  };


  const deleteSelected = () => {
    if (!selected) return;
    const next = products.filter((p) => p.id !== selected.id);
    onChangeProducts(next);
    setSelectedId(next[0]?.id ?? null);
  };

  const resetToDefault = () => {
    resetProductsToSeed();
    const next = loadProducts();
    onChangeProducts(next);
    setSelectedId(next[0]?.id ?? null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Admin</h1>
              <p className="text-sm text-muted-foreground">Edit product catalog (offline)</p>
            </div>
          </div>

          

          <div className="flex items-center gap-3">
            <Button variant='outline' onClick={onSeeOrders} >See old orders</Button>
            <Button variant="outline" onClick={resetToDefault}>Reset to defaults</Button>
            <Button onClick={addProduct} className="gap-2">
              <Plus className="w-5 h-5" />
              Add product
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Product list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  p.id === selectedId ? 'border-primary bg-muted' : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="font-medium text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.category}  • {p.unitPrice} kr/{p.unitLabel} • {p.casePrice} kr/flak
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-xl">Edit</CardTitle>
            <Button variant="outline" onClick={deleteSelected} disabled={!selected} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </CardHeader>

          <CardContent className="space-y-5">
            {!selected ? (
              <div className="text-muted-foreground">Select a product to edit.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} className="h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={selected.description}
                    onChange={(e) => updateSelected({ description: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Pricing row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit price (kr per {selected.unitLabel})</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={selected.unitPrice}
                      onChange={(e) => updateSelected({ unitPrice: Number(e.target.value) })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Case price (kr per flak/box)</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={selected.casePrice}
                      onChange={(e) => updateSelected({ casePrice: Number(e.target.value) })}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Case details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Case size</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={selected.caseSize}
                      onChange={(e) => updateSelected({
                        caseSize: Number(e.target.value),
                        unit: `${Number(e.target.value)} ${selected.unitLabel} per flak`,
                      })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit label</Label>
                    <Input
                      value={selected.unitLabel}
                      onChange={(e) => updateSelected({
                        unitLabel: e.target.value,
                        unit: `${selected.caseSize} ${e.target.value} per flak`,
                      })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={selected.category}
                      onChange={(e) => updateSelected({ category: e.target.value as Category })}
                      className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="lemonade">lemonade</option>
                      <option value="liquers">liquers</option>
                      <option value="Sockerlag">Sockerlag</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Unit string (display)</Label>
                  <Input value={selected.unit} onChange={(e) => updateSelected({ unit: e.target.value })} className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label>Image URL / Path</Label>
                  <Input value={selected.image} onChange={(e) => updateSelected({ image: e.target.value })} className="h-12" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}