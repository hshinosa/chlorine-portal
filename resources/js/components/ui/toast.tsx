import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export interface ToastItem { id: number; title?: string; message: string; type?: 'success' | 'error' | 'info'; duration?: number; }

let pushToastRef: ((t: Omit<ToastItem,'id'>) => void) | null = null;

export function useToast() {
  return { toast: (t: Omit<ToastItem,'id'>) => pushToastRef && pushToastRef(t) };
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    pushToastRef = (t) => {
      const id = Date.now() + Math.random();
      const item: ToastItem = { id, duration: 3500, type: 'info', ...t };
      setItems(prev => [...prev, item]);
      if (item.duration) setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), item.duration);
    };
    return () => { pushToastRef = null; };
  }, []);
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-2 w-80">
      {items.map(t => (
        <div key={t.id} className={`rounded-md border shadow bg-white p-4 text-sm flex flex-col gap-1 ${t.type==='success'?'border-green-200':''}${t.type==='error'?'border-red-200':''}`}> 
          {t.title && <div className="font-medium">{t.title}</div>}
          <div className={t.type==='error'? 'text-red-700' : t.type==='success'? 'text-green-700' : 'text-gray-700'}>{t.message}</div>
        </div>
      ))}
    </div>,
    document.body
  );
}
