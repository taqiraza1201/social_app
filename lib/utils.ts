// Simple cn helper (no external dependency)
export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
  return inputs
    .filter((x) => x !== false && x !== null && x !== undefined)
    .map((input) => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input as Record<string, boolean>)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCoins(amount: number): string {
  return amount.toLocaleString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'active':
      return 'text-green-400 bg-green-400/10';
    case 'pending':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'rejected':
    case 'removed':
      return 'text-red-400 bg-red-400/10';
    case 'completed':
      return 'text-blue-400 bg-blue-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
}
