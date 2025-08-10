import { useEffect, useRef } from 'react';

interface Options {
  enabled?: boolean;
  message?: string;
}

export function useUnsavedChanges(isDirty: boolean, { enabled = true, message = 'Perubahan belum disimpan, tinggalkan halaman?' }: Options = {}) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    if (!enabled) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const inertiaBefore = (e: Event) => {
      if (dirtyRef.current && !confirm(message)) {
        e.preventDefault();
      }
    };
    document.addEventListener('inertia:before', inertiaBefore as any);
    return () => document.removeEventListener('inertia:before', inertiaBefore as any);
  }, [enabled, message]);
}
