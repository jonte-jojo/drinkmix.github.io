// src/components/AdminCustomerOrders.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as  XLSX from "xlsx";

type CustomerRow = {
  id: string; // uuid
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type OrderRow = {
  id: string; // uuid
  customer_id: string; // uuid
  order_number: string | null;
  order_date: string | null;
  notes: string | null;
  total_price: number | null;
  signature: string | null;
  permit_url: string | null;
  created_at?: string | null;
  invoice?: string | null;
  orgNumber?: string | null;
  delivery_date?: string | null;
  phone?: string | null;
  address?: string | null;
  contact_person?: string | null;
  email?: string | null;
  company_name?: string | null;
};

type OrderItemRow = {
  id?: string; // uuid
  order_id: string; // uuid
  product_id: string | null;
  product_name: string | null;
  quantity: number | null;
  price_per_case: number | null;
  case_price: number | null;
};

type CustomerGroup = {
  key: string; // normalized company name
  company_name: string; // display name
  customerIds: string[]; // all customers that share the company_name
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

type OrderWithCustomer = OrderRow & {
    customers?: {
      company_name: string | null;
      contact_person: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
    } | {
      company_name: string | null;
      contact_person: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
    }[] | null;
  };

function isLikelyImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(url.split("?")[0]);
}

function isPdfUrl(url: string) {
  return /\.pdf$/i.test(url.split("?")[0]);
}

function formatSEK(n?: number | null) {
  if (typeof n !== "number") return "-";
  return `${n} kr`;
}

function formatOrderDate(o: { order_date: string | null; created_at?: string | null }) {
  const raw = o.order_date || o.created_at;
  if (!raw) return "Okänt datum";

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  return d.toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" });
}

const exportAllOrdersToExcel = async () => {
  try {
    const { data: allOrders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        order_date,
        total_price,
        notes,
        invoice,
        orgNumber,
        delivery_date,
        created_at,
        customers:customer_id (
          company_name,
          contact_person,
          email,
          phone,
          address
        )
      `)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    const { data: allItems, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, product_name, quantity, price_per_case, case_price");

    if (itemsError) throw itemsError;

    // ✅ Build a lookup map: order_id -> items[]
    const itemsByOrderId = new Map<string, typeof allItems>();

    for (const it of allItems ?? []) {
      const arr = itemsByOrderId.get(it.order_id) ?? [];
      arr.push(it);
      itemsByOrderId.set(it.order_id, arr);
    }

    const rows = (allOrders ?? []).map((o) => {
      const custRaw: any = (o as any).customers;
      const cust = Array.isArray(custRaw) ? custRaw[0] : custRaw;

      const itemsForOrder = itemsByOrderId.get(o.id) ?? [];

      const itemsText = itemsForOrder
        .map((it) => `${it.product_name ?? "Unknown"} x${it.quantity ?? 0}`)
        .join("; ");

      const orderTotalFromItems = itemsForOrder.reduce(
        (sum, it) => sum + (it.case_price ?? 0),
        0
      );

      return {
        OrderNumber: o.order_number ?? "",
        OrderDate: o.order_date ?? "",
        DeliveryDate: o.delivery_date ?? "",
        Company: cust?.company_name ?? "",
        Contact: cust?.contact_person ?? "",
        Email: cust?.email ?? "",
        Phone: cust?.phone ?? "",
        Address: cust?.address ?? "",
        OrgNumber: o.orgNumber ?? "",
        Invoice: o.invoice ?? "",
        Items: itemsText,
        OrderTotal: o.total_price ?? orderTotalFromItems,
        Notes: o.notes ?? "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Orders");

    XLSX.writeFile(workbook, "All_Customer_Orders.xlsx");
  } catch (error) {
    console.error("Export failed:", error);
  }
};
  

export function AdminCustomerOrders({ onClose }: { onClose: () => void }) {
  const [companies, setCompanies] = useState<CustomerGroup[]>([]);
  const [selectedCompanyKey, setSelectedCompanyKey] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.key === selectedCompanyKey) ?? null,
    [companies, selectedCompanyKey]
  );

  // 1) Load customers and group by company_name
  useEffect(() => {
    (async () => {
      setLoadingCustomers(true);
      try {
        // If you only want customers that have at least 1 order, use orders!inner(id) below.
        const { data, error } = await supabase
          .from("customers")
          .select(`
            id,
            company_name,
            contact_person,
            email,
            phone,
            address,
            orders!inner(id)
          `)
          .order("company_name", { ascending: true });

        if (error) throw error;

        const rows = (data ?? []) as (CustomerRow & { orders?: { id: string }[] })[];

        const map = new Map<string, CustomerGroup>();

        for (const r of rows) {
          const display = (r.company_name ?? "").trim();
          const key = display.toLowerCase();

          if (!key) continue;

          const existing = map.get(key);
          if (!existing) {
            map.set(key, {
              key,
              company_name: display,
              customerIds: [r.id],
              contact_person: r.contact_person,
              email: r.email,
              phone: r.phone,
              address: r.address,
              
            });
          } else {
            if (!existing.customerIds.includes(r.id)) existing.customerIds.push(r.id);
            if (!existing.company_name && display) existing.company_name = display;
          }
        }

        const grouped = Array.from(map.values()).sort((a, b) =>
          a.company_name.localeCompare(b.company_name, "sv")
        );

        setCompanies(grouped);

        if (grouped.length && selectedCompanyKey == null) {
          setSelectedCompanyKey(grouped[0].key);
        }
      } finally {
        setLoadingCustomers(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Load orders for selected company (all customer ids in that company group)
  useEffect(() => {
    if (!selectedCompany) return;

    (async () => {
      setLoadingOrders(true);
      setOrders([]);
      setSelectedOrderId(null);
      setOrderItems([]);

      try {
        const { data, error } = await supabase
  .from("orders")
  .select(`
    id,
    customer_id,
    order_number,
    order_date,
    notes,
    total_price,
    signature,
    permit_url,
    created_at,

    invoice,
    orgNumber,
    delivery_date,
    phone,
    address,
    contact_person,
    email,
    company_name,

    customers:customer_id!inner (
      company_name,
      contact_person,
      email,
      phone,
      address
    )
  `)
  .in("customer_id", selectedCompany.customerIds)
  .order("created_at", { ascending: false });

        if (error) throw error;

        const rows = (data ?? []) as OrderWithCustomer[];
        setOrders(rows);

        if (rows.length) setSelectedOrderId(rows[0].id);
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, [selectedCompany]);

  // 3) Load items for selected order
  useEffect(() => {
    if (selectedOrderId == null) return;

    (async () => {
      setLoadingOrderItems(true);
      setOrderItems([]);
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("id, order_id, product_id, product_name, quantity, price_per_case, case_price")
          .eq("order_id", selectedOrderId)
          .order("product_name", { ascending: true });

        if (error) throw error;

        setOrderItems((data ?? []) as OrderItemRow[]);
      } finally {
        setLoadingOrderItems(false);
      }
    })();
  }, [selectedOrderId]);

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
          <Button onClick={() => exportAllOrdersToExcel()} className="h-10">
                Export to Excel
              </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* LEFT: Companies */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Kunder</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {loadingCustomers && <div className="text-muted-foreground">Laddar kunder...</div>}

            {!loadingCustomers && companies.length === 0 && (
              <div className="text-muted-foreground">Inga kunder hittades än.</div>
            )}

            {companies.map((c) => {
              const active = c.key === selectedCompanyKey;
              const title = c.company_name || "(Namnlös kund)";
              const sub = [c.contact_person, c.email].filter(Boolean).join(" • ");

              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCompanyKey(c.key)}
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
              {selectedCompany ? selectedCompany.company_name : "Välj en kund"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {loadingOrders ? (
              <div className="text-muted-foreground">Laddar ordrar...</div>
            ) : orders.length === 0 ? (
              <div className="text-muted-foreground">Den här kunden har inga ordrar.</div>
            ) : (
              <Tabs
                value={String(selectedOrderId ?? orders[0].id)}
                onValueChange={(val) => setSelectedOrderId(val)}
                className="w-full"
              >
                <TabsList className="flex w-full gap-2 bg-transparent p-0 overflow-x-auto whitespace-nowrap no-scrollbar">
                  {orders.map((o) => (
                    <TabsTrigger
                      key={o.id}
                      value={String(o.id)}
                      className="rounded-full px-4 py-2 border bg-emerald-100 text-emerald-900 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                    >
                      {formatOrderDate(o)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {orders.map((o) => {
                    const cust = Array.isArray(o.customers) ? o.customers[0] : o.customers;
                    return(
                  <TabsContent key={o.id} value={String(o.id)} className="mt-6">
                    
                    <div className="space-y-6">
                        
                      
                      {/* Customer info */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Customer Information</CardTitle>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">

                              {/* Company */}
                              <div>
                                <div className="text-muted-foreground text-xs">Company</div>
                                <div className="font-medium">{cust?.company_name ?? "-"}</div>
                              </div>

                              {/* Contact */}
                              <div>
                                <div className="text-muted-foreground text-xs">Contact</div>
                                <div className="font-medium">{cust?.contact_person ?? "-"}</div>
                              </div>

                              {/* Email */}
                              <div>
                                <div className="text-muted-foreground text-xs">Email</div>
                                <div className="font-medium">{cust?.email ?? "-"}</div>
                              </div>

                              {/* Phone */}
                              <div>
                                <div className="text-muted-foreground text-xs">Phone</div>
                                <div className="font-medium">{cust?.phone ?? "-"}</div>
                              </div>

                              {/* Address + Org number (same row) */}
                              <div>
                                <div className="text-muted-foreground text-xs">Address</div>
                                <div className="font-medium">{cust?.address ?? "-"}</div>
                              </div>

                              <div>
                                <div className="text-muted-foreground text-xs">Org number</div>
                                <div className="font-medium">{o.orgNumber ?? "-"}</div>
                              </div>

                              {/* Invoice + Delivery (same row) */}
                              <div>
                                <div className="text-muted-foreground text-xs">Invoice info</div>
                                <div className="font-medium">{o.invoice ?? "-"}</div>
                              </div>

                              <div>
                                <div className="text-muted-foreground text-xs">Delivery date</div>
                                <div className="font-medium">{o.delivery_date ?? "-"}</div>
                              </div>

                            </CardContent>
                          </Card>

                      {/* Order meta */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Order ID:</span> {o.id}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Order number:</span>{" "}
                            {o.order_number ?? "-"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Order date:</span>{" "}
                            {o.order_date ?? "-"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>{" "}
                            {formatSEK(o.total_price)}, exkl. moms
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Notes:</span> {o.notes ?? "-"}
                          </div>

                          {/* Permit */}
                          <div className="sm:col-span-2">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <FileText className="w-4 h-4" />
                              Alkoholtillstånd
                            </div>

                            {!o.permit_url ? (
                              <div className="text-muted-foreground text-sm">Ingen fil uppladdad.</div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-3">
                                  <a
                                    href={o.permit_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm underline"
                                  >
                                    Öppna fil
                                  </a>
                                  <a href={o.permit_url} download className="text-sm underline">
                                    Ladda ner
                                  </a>
                                </div>

                                {isLikelyImageUrl(o.permit_url) && (
                                  <img
                                    src={o.permit_url}
                                    alt="Alkoholtillstånd"
                                    className="max-h-80 w-full rounded-md border bg-white object-contain"
                                  />
                                )}

                                {isPdfUrl(o.permit_url) && (
                                  <iframe
                                    title="Alkoholtillstånd (PDF)"
                                    src={o.permit_url}
                                    className="w-full h-[520px] rounded-md border bg-white"
                                  />
                                )}

                                {!isLikelyImageUrl(o.permit_url) && !isPdfUrl(o.permit_url) && (
                                  <div className="text-muted-foreground text-sm">
                                    Förhandsvisning stöds inte för denna filtyp. Använd “Öppna fil”.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Items */}
                      
                          {loadingOrderItems && (
                            <div className="text-muted-foreground">Laddar items...</div>
                          )}

                          {!loadingOrderItems && orderItems.length === 0 && (
                            <div className="text-muted-foreground">
                              Inga items hittades för denna order.
                            </div>
                          )}

                          {orderItems.map((it, i) => (
                            <div
                              key={it.id ?? `${it.order_id}-${it.product_id ?? i}`}
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
                       
                          {/* Signature */}
                          <div className="sm:col-span-2">
                            <div className="text-muted-foreground mb-2">Signature</div>
                            {!o.signature ? (
                              <div className="text-muted-foreground text-sm">Ingen signatur sparad.</div>
                            ) : (
                              <img
                                src={o.signature}
                                alt="Signature"
                                className="max-h-56 rounded-md border bg-white object-contain"
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                    );
                          })}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}