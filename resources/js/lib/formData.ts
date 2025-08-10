// Utility for building FormData from plain objects (supports nested + arrays)
export function buildFormData(obj: Record<string, any>): FormData {
  const fd = new FormData();
  const append = (key: string, value: any) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (Array.isArray(value)) {
      if (value.length && typeof value[0] === 'object') {
        fd.append(key, JSON.stringify(value));
      } else {
        value.forEach(v => fd.append(`${key}[]`, v));
      }
    } else if (typeof value === 'object') {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  };
  Object.entries(obj).forEach(([k, v]) => append(k, v));
  return fd;
}

// Status helpers
export const statusLabels: Record<string, string> = {
  aktif: 'Aktif',
  draft: 'Draft',
  published: 'Published',
  'non-aktif': 'Non Aktif',
};

export function getStatusLabel(status: string) {
  return statusLabels[status] || status;
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (['aktif', 'published', 'Aktif'].includes(status)) return 'default';
  if (['draft', 'Draft'].includes(status)) return 'secondary';
  if (['non-aktif', 'Non-Aktif', 'disabled'].includes(status)) return 'outline';
  return 'secondary';
}
