
// Format number as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format number with thousand separators
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Format date and time
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// Format date only
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

// Calculate price change percentage
export const calculatePriceChange = (currentPrice: number, previousPrice: number): number => {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

// Format price change with + or - sign and percentage
export const formatPriceChange = (currentPrice: number, previousPrice: number): string => {
  const change = calculatePriceChange(currentPrice, previousPrice);
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

// Get CSS class based on price movement
export const getPriceChangeClass = (currentPrice: number, previousPrice: number): string => {
  if (currentPrice > previousPrice) return 'stock-up';
  if (currentPrice < previousPrice) return 'stock-down';
  return 'text-stock-neutral';
};

// Get status color
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Hủy': 'text-gray-500',
    'Chưa': 'text-amber-500',
    'Một phần': 'text-blue-500',
    'Hết': 'text-green-500',
    'Chờ': 'text-purple-500'
  };
  
  return statusColors[status] || 'text-gray-500';
};

// Format order type
export const formatOrderType = (type: string): string => {
  return type === 'M' ? 'Mua' : 'Bán';
};

// Get order type color
export const getOrderTypeColor = (type: string): string => {
  return type === 'M' ? 'text-blue-500' : 'text-red-500';
};
