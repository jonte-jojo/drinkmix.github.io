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
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

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
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    orderDate: '',
    invoice: '',
    orgNumber: '',
    deliveryDate: '',
  });

  const [adminEmail, setAdminEmail] = useState<string>("");

  const normalize = (s?: string) => (s ?? "").toLowerCase();
  
  const isSockerlag = (p: Product) => normalize(p.category) === "sockerlag";
  const isCaseProduct = (p: Product) => p.caseSize === 24 !== isSockerlag(p);
  const priceEach = (p: Product) => (isCaseProduct(p) ? p.casePrice : p.unitPrice);
  


  const selectedProducts = Object.entries(orderItems)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, quantity]) => ({
      product: products.find((p) => p.id === productId),
      quantity,
    }))
    .filter((x): x is { product: Product; quantity: number } => Boolean(x.product));

  const totalPrice = selectedProducts.reduce(
    (sum, { product, quantity }) => sum + priceEach(product) * quantity,
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
  const orderDate = new Date().toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const orderNumber = `DM-${Date.now().toString().slice(-6)}`;
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please have the customer sign the order before submitting.",
        variant: "destructive",
      });
      return;
    }
  
    if (!customer.companyName || !customer.contactPerson || !customer.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in company name, contact person, and email.",
        variant: "destructive",
      });
      return;
    }

    useEffect(() => {
      const getUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data.user) {
          setAdminEmail(data.user.email ?? "");
        }
      };

      getUser();
    }, []);
    
  
    setIsSubmitting(true);
  
    try {
      // ✅ 1) SAVE CUSTOMER
      const { data: customerData, error: customerError } = await supabase
  .from("customers")
  .upsert(
    [{
      company_name: customer.companyName,
      contact_person: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      invoice: customer.invoice,
      orgNumber: customer.orgNumber,
    }],
    { onConflict: "email,company_name" }
  )
  .select()
  .single();

if (customerError) throw customerError;
  
      
      // ✅ 2) SAVE ORDER
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
          customer_id: customerData.id,
          order_number: orderNumber,
          order_date: orderDate,
          notes: customer.notes,
          total_price: totalPrice,
          signature: signature,
          permit_url: null,

          company_name: customer.companyName,
          contact_person: customer.contactPerson,
          phone: customer.phone,
          address: customer.address,
          email: customer.email,
          invoice: customer.invoice,
          orgNumber: customer.orgNumber,
          delivery_date: customer.deliveryDate,
          },
        ])
        .select()
        .single();
  
      if (orderError) throw orderError;
      let permitUrl: string | null = null;

      if (permitFile) {
        const ext = permitFile.name.split(".").pop()?.toLowerCase() || "bin";
        const filePath = `permits/${orderNumber}_${Date.now()}.${ext}`;
      
        const { error: uploadError } = await supabase
          .storage
          .from("permits")
          .upload(filePath, permitFile, {
            upsert: true,
            contentType: permitFile.type || undefined,
          });
      
        if (uploadError) throw uploadError;
      
        const { data } = supabase.storage.from("permits").getPublicUrl(filePath);
        permitUrl = data.publicUrl;
      }
      // ✅ 3) SAVE ORDER ITEMS
      const itemsToInsert = selectedProducts.map(({ product, quantity }) => ({
        order_id: orderData.id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        price_per_case: product.casePrice,
        case_price: product.casePrice * quantity,
      }));
  
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);
  
      if (itemsError) throw itemsError;
  
      // ✅ 4) SEND EMAIL CONFIRMATION
      const orderLines = selectedProducts
        .map(({ product, quantity }) =>
          `${product.name} - ${quantity} ${isCaseProduct(product) ? "flak" : product.unitLabel}`
        )
        .join("\n");
        
        
      const emailParams = {
        to_email: customer.email,
        admin_email: adminEmail,
        company: customer.companyName,
        contact: customer.contactPerson,
        order_number: orderNumber,
        order_date: orderDate,
        order_details: orderLines,
        total_price: `${totalPrice} kr`,
        notes: customer.notes || "No notes",
        invoice: customer.invoice || "N/A",
        orgNumber: customer.orgNumber || "N/A",
        delivery_date: customer.deliveryDate || "N/A",
        permit_url: permitUrl || "No permit uploaded",
        phone: customer.phone || "N/A",
        address: customer.address || "N/A",
      };
  
      console.log("SENDING EMAIL", emailParams);
  
      await emailjs.send(
        "Jontetest.drinkmix.se",     // ✅ SERVICE_ID
        "template_h792ji4",          // ✅ TEMPLATE_ID
        emailParams,
        "ejGAHYSgUfAMbHPJl"          // ✅ PUBLIC_KEY
      );
  
      console.log("EMAIL SENT SUCCESSFULLY");
  
      // ✅ DONE
      toast({
        title: "Order Submitted!",
        description: `Order saved and confirmation email sent to ${customer.email}.`,
      });
  
      onOrderComplete();
    } catch (error) {
      console.error("Order failed:", error);
  
      toast({
        title: "Order failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
                      Customer Email *
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
                  <div className="space-y-2">
                    <Label htmlFor="invoice" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Invoice Reference *
                    </Label>
                    <Input
                      id="invoice"
                      value={customer.invoice}
                      onChange={(e) => handleInputChange('invoice', e.target.value)}
                      placeholder="Invoice email or reference"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgNumber" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Organization Number *
                    </Label>
                    <Input
                      id="orgNumber"
                      value={customer.orgNumber}
                      onChange={(e) => handleInputChange('orgNumber', e.target.value)}
                      placeholder="Organization number"
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
                  <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Estimated Delivery Date
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={customer.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permit">Alkoholtillstånd (bild eller PDF)</Label>
                    <Input
                      id="permit"
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={(e) => setPermitFile(e.target.files?.[0] ?? null)}
                  />
                    {permitFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {permitFile.name}
                      </p>
                    )}
                    
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="permitSeen"
                    type="checkbox"
                    className="h-4 w-4 text-secondary focus:ring-secondary border-border rounded"
                  />
                  <Label htmlFor="permitSeen" className="text-sm text-muted-foreground">
                    I confirm that I have reviewed the alcohol permit.
                  </Label>
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
        {priceEach(product) * quantity} kr
      </p>
      <p className="text-xs text-muted-foreground">
        {priceEach(product)} kr / {isCaseProduct(product) ? "flak" : product.unitLabel}
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
                  <p className="text-sm text-muted-foreground mt-1">excl. moms</p>
                  <div className='text-center mt-1'>
                  <span className='text-sm text-muted-foreground' >(Fakturering sker via Prioritet Finans)</span>
                </div>
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
