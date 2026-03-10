import { FileX } from 'lucide-react';
export default function EmptyState({ title = 'No data found', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-bg-card rounded-full mb-4"><FileX size={32} className="text-text-muted" /></div>
      <h3 className="text-text-primary font-semibold mb-1">{title}</h3>
      {description && <p className="text-text-secondary text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
