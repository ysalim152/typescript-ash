import { Card } from './card';
import { Button } from './button';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export const ConfirmationDialog = ({ title, message, onConfirm, onCancel, isPending }: ConfirmationDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>{isPending ? 'Suppression...' : 'Confirmer'}</Button>
        </div>
      </Card>
    </div>
  );
};