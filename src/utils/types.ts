
export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  birthDate: string;
  address: string;
  phone: string;
  idNumber: string;
  gender: 'Nam' | 'Nữ';
  role: 'investor' | 'employee'; // Add role property
}

export interface BankAccount {
  id: string;
  userId: string;
  balance: number;
  bankId: string;
}

export interface Bank {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Stock {
  code: string;
  companyName: string;
  address: string;
  totalShares: number;
  currentPrice: number;
  previousClose: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  ceilingPrice: number;
  floorPrice: number;
  referencePrice: number;
}

export type OrderType = 'M' | 'B'; // M: Mua (Buy), B: Bán (Sell)
export type OrderMethod = 'LO' | 'ATO' | 'ATC';
export type OrderStatus = 'Hủy' | 'Chưa' | 'Một phần' | 'Hết' | 'Chờ';

export interface Order {
  id: number;
  date: string;
  type: OrderType;
  method: OrderMethod;
  quantity: number;
  stockCode: string;
  price: number;
  accountId: string;
  status: OrderStatus;
}

export interface Transaction {
  id: number;
  orderId: number;
  date: string;
  quantity: number;
  price: number;
  matchType: 'Khớp 1 phần' | 'Khớp hết';
}

export interface StockOwnership {
  userId: string;
  stockCode: string;
  quantity: number;
}

export interface PriceHistory {
  stockCode: string;
  date: string;
  ceilingPrice: number;
  floorPrice: number;
  referencePrice: number;
}

export interface MoneyTransaction {
  id: number;
  userId: string;
  date: string;
  openingBalance: number;
  amount: number;
  reason: string;
  closingBalance: number;
}
