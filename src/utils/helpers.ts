export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const day = 86400000;

  if (diff < 60000) return 'Agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
  if (diff < day) {
    const d = new Date(timestamp);
    return `Hoje, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  if (diff < 2 * day) return 'Ontem';
  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getDocIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('nota') || lower.includes('fiscal') || lower.includes('recibo')) return '🧾';
  if (lower.includes('contrato')) return '📋';
  if (lower.includes('relat')) return '📊';
  if (lower.includes('certid') || lower.includes('rg') || lower.includes('cpf')) return '🏛️';
  if (lower.includes('anota') || lower.includes('reuni')) return '📝';
  return '📄';
}
