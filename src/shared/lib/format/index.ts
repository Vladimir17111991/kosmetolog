export const money = (value: number): string =>
  new Intl.NumberFormat('ru-BY', {
    style: 'currency',
    currency: 'BYN',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(value);

function formatDate(key: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString('ru-RU', { ...options, timeZone: 'UTC' });
}

export const fullDate = (key: string): string =>
  formatDate(key, { day: 'numeric', month: 'long', year: 'numeric' });
export const shortDate = (key: string): string =>
  formatDate(key, { day: 'numeric', month: 'short' });
export const dayName = (key: string): string => formatDate(key, { weekday: 'short' });
