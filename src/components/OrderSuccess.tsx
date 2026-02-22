import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Plus, Citrus } from 'lucide-react';

interface OrderSuccessProps {
  onNewOrder: () => void;
}

export const OrderSuccess = ({ onNewOrder }: OrderSuccessProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-citrus-green to-citrus-lime rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <CheckCircle2 className="w-14 h-14 text-secondary-foreground" />
          </div>
          
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
            Order Submitted!
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            The order has been sent successfully. A confirmation email will arrive shortly.
          </p>

          <div className="flex items-center justify-center gap-3 text-muted-foreground mb-8">
            <Citrus className="w-5 h-5" />
            <span>Glommens Dryckesfabrik</span>
          </div>

          <Button
            onClick={onNewOrder}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-14 px-8 text-lg"
          >
            <Plus className="w-5 h-5" />
            Start New Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
