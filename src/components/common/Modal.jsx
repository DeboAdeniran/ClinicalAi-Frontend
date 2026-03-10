import { X } from 'lucide-react';
export default function Modal({ isOpen, onClose, title, children, width = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card ${width} w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-border transition-colors"><X size={18} className="text-text-secondary" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
