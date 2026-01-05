import { useState, type FormEvent } from 'react';
import type { CustomerInfo, Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignaturePad } from './SignaturePad';
import { ArrowLeft, Send, Building2, User, Mail, Phone, MapPin, FileText, Citrus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import emailjs from "@emailjs/browser";

interface OrderFormProps {
  products: Product[];
  orderItems: Record<string, number>;
  onBack: () => void;
  onOrderComplete: () => void;
  onOrderItemsChange: (items: Record<string, number>) => void;
}

export const OrderForm = ({ products, orderItems, onOrderItemsChange, onBack, onOrderComplete }: OrderFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState('');
  const [customer, setCustomer] = useState<CustomerInfo>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const selectedProducts = Object.entries(orderItems)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, quantity]) => ({
      product: products.find((p) => p.id === productId),
      quantity,
    }))
    .filter((x): x is { product: Product; quantity: number } => Boolean(x.product));

  const totalPrice = selectedProducts.reduce(
    (sum, item) => sum + item.product.casePrice * item.quantity,
    0
  );

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };
  const increment = (productId: string) => {
    onOrderItemsChange({
      ...orderItems,
      [productId]: (orderItems[productId] || 0) + 1,
    });
  };
  
  const decrement = (productId: string) => {
    const current = orderItems[productId] || 0;
  
    if (current <= 1) {
      const next = { ...orderItems };
      delete next[productId];
      onOrderItemsChange(next);
    } else {
      onOrderItemsChange({
        ...orderItems,
        [productId]: current - 1,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!signature) {
      toast({
        title: 'Signature Required',
        description: 'Please have the customer sign the order before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!customer.companyName || !customer.contactPerson || !customer.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in company name, contact person, and email.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // For now, simulate order submission
    // TODO: Replace with actual email sending via edge function
    try {
      const orderLines = selectedProducts
        .map(({ product, quantity }) => `${product.name} - ${quantity} flak`)
        .join("\n");
    
      const emailParams = {
        to_email: customer.email,
        company: customer.companyName,
        contact: customer.contactPerson,
        order_number: orderNumber,
        order_date: orderDate,
        order_details: orderLines,
        total_price: totalPrice,
        notes: customer.notes || "No notes",
      };
    
      await emailjs.send(
        "Jontetest.drinkmix.se",
        "template_h792ji4",
        emailParams,
        "dLeYvzovlKIZTi1fi"
      );
    
      toast({
        title: "Order Submitted!",
        description: `Confirmation email sent to ${customer.email}.`,
      });
    
      onOrderComplete();
    } catch (error) {
      console.error("Email send failed:", error);
      toast({
        title: "Failed to send email",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }

    toast({
      title: 'Order Submitted!',
      description: `Order for ${customer.companyName} has been sent successfully.`,
    });

    setIsSubmitting(false);
    onOrderComplete();
  };

  const orderDate = new Date().toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const orderNumber = `DM-${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-citrus-yellow to-citrus-green rounded-full flex items-center justify-center">
                  <Citrus className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h1 className="font-heading text-xl font-bold text-foreground">New Order</h1>
                  <p className="text-sm text-muted-foreground">{orderDate} • {orderNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-secondary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Restaurant / Café Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={customer.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g., Café Stockholm"
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Person *
                  </Label>
                  <Input
                    id="contactPerson"
                    value={customer.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Full name"
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customer.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+46 70 123 4567"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </Label>
                  <Input
                    id="address"
                    value={customer.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street, City, Postal Code"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Order Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={customer.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special requests or delivery instructions..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Customer Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <SignaturePad signature={signature} onSignatureChange={setSignature} />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProducts.map(({ product, quantity }) => (<div
    key={product.id}
    className="flex items-center justify-between py-3 border-b border-border last:border-0"
  >
    <div className="flex-1">
      <p className="font-medium text-foreground">{product.name}</p>
      <p className="text-sm text-muted-foreground">
        {product.unitPrice} kr / {product.unitLabel} • Min order 1 flak
      </p>
    </div>

    {/* ✅ Quantity Controls */}
    <div className="flex items-center gap-2 px-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={() => decrement(product.id)}
      >
        −
      </Button>

      <span className="text-lg font-semibold min-w-[2rem] text-center">
        {quantity}x
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={() => increment(product.id)}
      >
        +
      </Button>
    </div>

    {/* ✅ Price */}
    <div className="text-right">
      <p className="font-semibold text-foreground">
        {product.casePrice * quantity} kr
      </p>
      <p className="text-xs text-muted-foreground">
        {product.casePrice} kr / flak
      </p>
    </div>
  </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-heading font-semibold">Total</span>
                    <span className="text-3xl font-bold text-secondary">{totalPrice} kr</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">excl. VAT</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-16 text-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Submitting Order...'
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Submit Order
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Order confirmation will be sent to {customer.email || 'the customer email'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
