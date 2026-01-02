type ToastArgs = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = ({ title, description, variant }: ToastArgs) => {
    // Minimal working toast for sample app.
    // Replace with your preferred toast library later.
    const prefix = variant === 'destructive' ? 'Error: ' : '';
    const message = description ? `${prefix}${title}\n\n${description}` : `${prefix}${title}`;
    // eslint-disable-next-line no-alert
    alert(message);
  };

  return { toast };
}
