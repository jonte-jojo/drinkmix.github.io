import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface SeeOldOrdersProps {
  onBack: () => void;
}

export const SeeOldOrders = ({ onBack }: SeeOldOrdersProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          order_date,
          total_price,
          notes,
          signature,
          customers (
            id,
            company_name,
            contact_person,
            email,
            phone,
            address
          ),
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            price_per_case,
            case_price
          )
        `)
        .order("id", { ascending: false });

      if (error) {
        console.error("Failed to fetch orders:", error);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold">All Orders</h1>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex justify-between">
                  <span>Order #{order.order_number}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ID: {order.id}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h2 className="font-semibold mb-2">Customer</h2>
                  <p><b>Company:</b> {order.customers?.company_name}</p>
                  <p><b>Contact:</b> {order.customers?.contact_person}</p>
                  <p><b>Email:</b> {order.customers?.email}</p>
                  <p><b>Phone:</b> {order.customers?.phone}</p>
                  <p><b>Address:</b> {order.customers?.address}</p>
                </div>

                {/* Order Info */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h2 className="font-semibold mb-2">Order Info</h2>
                  <p><b>Date:</b> {order.order_date}</p>
                  <p><b>Total:</b> {order.total_price} kr</p>
                  <p><b>Notes:</b> {order.notes || "No notes"}</p>
                </div>

                {/* Order Items */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h2 className="font-semibold mb-3">Items</h2>

                  {order.order_items?.length === 0 ? (
                    <p>No items</p>
                  ) : (
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} flak
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">{item.case_price} kr</p>
                            <p className="text-sm text-muted-foreground">
                              {item.price_per_case} kr / flak
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signature */}
                {order.signature && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h2 className="font-semibold mb-2">Signature</h2>
                    <img
                      src={order.signature}
                      alt="Signature"
                      className="border rounded-md max-w-full h-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};