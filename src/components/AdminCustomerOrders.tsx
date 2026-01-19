// src/components/AdminCustomerOrders.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

type CustomerRow = {
  id: number;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type OrderRow = {
  id: number;
  customer_id: number;
  order_number: string | null;
  order_date: string | null;
  notes: string | null;
  total_price: number | null;
  signature: string | null;
  permit_url: string | null;
  created_at?: string | null;
};

type OrderItemRow = {
  id?: number;
  order_id: number;
  product_id: string | null;
  product_name: string | null;
  quantity: number | null;
  price_per_case: number | null;
  case_price: number | null;
};

function isLikelyImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(url.split("?")[0]);
}

function formatSEK(n?: number | null) {
  if (typeof n !== "number") return "-";
  return `${n} kr`;
}

export function AdminCustomerOrders({
  onClose,
}: {
  onClose: () => void;
}) {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  // 1) Load customers
  // 1) Load customers (ONLY customers that have at least 1 order)
useEffect(() => {
    (async () => {
      setLoadingCustomers(true);
      try {
        // This returns one row per order => we dedupe customers in JS
        const { data, error } = await supabase
          .from("customers")
          .select(
            `
            id,
            company_name,
            contact_person,
            email,
            phone,
            address,
            orders!inner(id)
          `
          )
          .order("company_name", { ascending: true });
  
        if (error) throw error;
  
        const rows = (data ?? []) as (CustomerRow & { orders?: { id: number }[] })[];
  
        // Deduplicate customers (because inner join duplicates per order)
        const byId = new Map<number, CustomerRow>();
        for (const r of rows) {
          byId.set(r.id, {
            id: r.id,
            company_name: r.company_name,
            contact_person: r.contact_person,
            email: r.email,
            phone: r.phone,
            address: r.address,
          });
        }
  
        const uniqueCustomers = Array.from(byId.values());
        setCustomers(uniqueCustomers);
  
        if (uniqueCustomers.length && selectedCustomerId == null) {
          setSelectedCustomerId(uniqueCustomers[0].id);
        }
      } finally {
        setLoadingCustomers(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 2) Load orders for selected customer
  useEffect(() => {
    if (selectedCustomerId == null) return;

    (async () => {
      setLoadingOrders(true);
      setOrders([]);
      setSelectedOrderId(null);
      setOrderItems([]);

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, customer_id, order_number, order_date, notes, total_price, signature, permit_url, created_at")
          .eq("customer_id", selectedCustomerId)
          .order("id", { ascending: false });

        if (error) throw error;

        const rows = (data ?? []) as OrderRow[];
        setOrders(rows);

        // auto-select newest order
        if (rows.length) setSelectedOrderId(rows[0].id);
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, [selectedCustomerId]);

  // 3) Load items for selected order
  useEffect(() => {
    if (selectedOrderId == null) return;

    (async () => {
      setLoadingOrderItems(true);
      setOrderItems([]);
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("order_id, product_id, product_name, quantity, price_per_case, case_price")
          .eq("order_id", selectedOrderId)
          .order("product_name", { ascending: true });

        if (error) throw error;

        setOrderItems((data ?? []) as OrderItemRow[]);
      } finally {
        setLoadingOrderItems(false);
      }
    })();
  }, [selectedOrderId]);

  function isPdfUrl(url: string) {
    return /\.pdf$/i.test(url.split("?")[0]);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Admin</h1>
              <p className="text-sm text-muted-foreground">Kunder & ordrar</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* LEFT: Customers */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Kunder</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {loadingCustomers && <div className="text-muted-foreground">Laddar kunder...</div>}

            {!loadingCustomers && customers.length === 0 && (
              <div className="text-muted-foreground">Inga kunder hittades än.</div>
            )}

            {customers.map((c) => {
              const active = c.id === selectedCustomerId;
              const title = c.company_name || "(Namnlös kund)";
              const sub = [c.contact_person, c.email].filter(Boolean).join(" • ");

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    active ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="font-medium text-foreground">{title}</div>
                  <div className="text-xs text-muted-foreground">{sub || "—"}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* RIGHT: Orders + Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              {selectedCustomer ? (selectedCustomer.company_name ?? "Kund") : "Välj en kund"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Orders tabs */}
            <div className="flex flex-wrap gap-2">
              {loadingOrders && <div className="text-muted-foreground">Laddar ordrar...</div>}

              {!loadingOrders && orders.length === 0 && (
                <div className="text-muted-foreground">Den här kunden har inga ordrar.</div>
              )}

              {orders.map((o, idx) => {
                const active = o.id === selectedOrderId;
                const label = o.order_number || `Order ${idx + 1}`;

                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`px-4 py-2 rounded-full text-sm border transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 border-border hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Order details */}
            {!selectedOrder ? (
              <div className="text-muted-foreground">Välj en order för att se detaljer.</div>
            ) : (
              <div className="space-y-6">
                {/* Customer info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Company:</span> {selectedCustomer?.company_name ?? "-"}</div>
                    <div><span className="text-muted-foreground">Contact:</span> {selectedCustomer?.contact_person ?? "-"}</div>
                    <div><span className="text-muted-foreground">Email:</span> {selectedCustomer?.email ?? "-"}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {selectedCustomer?.phone ?? "-"}</div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> {selectedCustomer?.address ?? "-"}</div>
                  </CardContent>
                </Card>

                {/* Order meta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Order ID:</span> {selectedOrder.id}</div>
                    <div><span className="text-muted-foreground">Order number:</span> {selectedOrder.order_number ?? "-"}</div>
                    <div><span className="text-muted-foreground">Order date:</span> {selectedOrder.order_date ?? "-"}</div>
                    <div><span className="text-muted-foreground">Total:</span> {formatSEK(selectedOrder.total_price)}</div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Notes:</span> {selectedOrder.notes ?? "-"}</div>

                    {/* Permit file */}
                    {/* Permit file */}
<div className="sm:col-span-2">
  <div className="flex items-center gap-2 text-muted-foreground mb-2">
    <FileText className="w-4 h-4" />
    Alkoholtillstånd
  </div>

  {!selectedOrder.permit_url ? (
    <div className="text-muted-foreground text-sm">Ingen fil uppladdad.</div>
  ) : (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <a
          href={selectedOrder.permit_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          Öppna fil
        </a>

        <a
          href={selectedOrder.permit_url}
          download
          className="text-sm underline"
        >
          Ladda ner
        </a>
      </div>

      {/* IMAGE PREVIEW */}
      {isLikelyImageUrl(selectedOrder.permit_url) && (
        <img
          src={selectedOrder.permit_url}
          alt="Alkoholtillstånd"
          className="max-h-80 w-full rounded-md border bg-white object-contain"
        />
      )}

      {/* PDF PREVIEW */}
      {isPdfUrl(selectedOrder.permit_url) && (
        <iframe
          title="Alkoholtillstånd (PDF)"
          src={selectedOrder.permit_url}
          className="w-full h-[520px] rounded-md border bg-white"
        />
      )}

      {/* FALLBACK (unknown file type) */}
      {!isLikelyImageUrl(selectedOrder.permit_url) && !isPdfUrl(selectedOrder.permit_url) && (
        <div className="text-muted-foreground text-sm">
          Förhandsvisning stöds inte för denna filtyp. Använd “Öppna fil”.
        </div>
      )}
    </div>
  )}
</div>

                    {/* Signature */}
                    <div className="sm:col-span-2">
                      <div className="text-muted-foreground mb-2">Signature</div>
                      {!selectedOrder.signature ? (
                        <div className="text-muted-foreground text-sm">Ingen signatur sparad.</div>
                      ) : (
                        // om du sparar signaturen som dataURL (vanligt), så funkar <img>
                        <img
                          src={selectedOrder.signature}
                          alt="Signature"
                          className="max-h-56 rounded-md border bg-white object-contain"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loadingOrderItems && <div className="text-muted-foreground">Laddar items...</div>}
                    {!loadingOrderItems && orderItems.length === 0 && (
                      <div className="text-muted-foreground">Inga items hittades för denna order.</div>
                    )}

                    {orderItems.map((it, i) => (
                      <div
                        key={`${it.order_id}-${it.product_id ?? i}`}
                        className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                      >
                        <div>
                          <div className="font-medium">{it.product_name ?? "(okänd produkt)"}</div>
                          <div className="text-xs text-muted-foreground">
                            {it.quantity ?? 0} flak • {formatSEK(it.price_per_case)} / flak
                          </div>
                        </div>
                        <div className="font-semibold">{formatSEK(it.case_price)}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}