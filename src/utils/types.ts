export interface User {
  username: string;
  HoTen: string;
  password?: string;
  Email: string;
  NgaySinh: string;
  DiaChi: string;
  Phone: string;
  CMND: string;
  GioiTinh: "Nam" | "Nữ";
  role: "NhanVien" | "NhaDauTu"; // Add role property
}

export interface BankAccount {
  MaTK: string;
  username: string;
  SoTien: number;
  MaNH: string;
}

export interface Bank {
  MaNH: string;
  TenNH: string;
  DiaChi: string;
  Phone: string;
  Email: string;
}

// export interface Stock {
//   MaCP: string;
//   TenCty: string;
//   DiaChi: string;
//   SoLuongPH?: number;
//   GiaKhopCuoi?: number;
//   previousClose?: number;
//   openPrice?: number;
//   highPrice?: number;
//   lowPrice?: number;
//   TongKLKhop?: number;
//   TongKLDatMua?: number;
//   TongKLDatBan?: number;
//   PhanTramThayDoi?: number;
//   ThayDoi?: number;

//   GiaTran?: number;
//   GiaSan?: number;
//   GiaTC: number;
// }

export interface Stock {
  MaCP?: string;
  TenCty?: string;
  DiaChi?: string;
  SoLuongPH?: number;
  GiaDongCua?: number;
  GiaMoCua?: number;
  GiaCaoNhat?: number;
  GiaThapNhat?: number;
  GiaKhopCuoi?: number;
  GiaSan?: number;
  GiaTC?: number;
  GiaTran?: number;
  GiaBan1?: number;
  GiaBan2?: number;
  GiaBan3?: number;
  GiaMua1?: number;
  GiaMua2?: number;
  GiaMua3?: number;
  KLBan1?: number;
  KLBan2?: number;
  KLBan3?: number;
  KLMua1?: number;
  KLMua2?: number;
  KLMua3?: number;
  KLKhopCuoi?: number;
  PhanTramThayDoi?: number;
  ThayDoi?: number;
  TongKLDatBan?: number;
  TongKLDatMua?: number;
  TongKLKhop?: number;

  Status?: number; // 0: Chưa niêm yết, 1: Đang giao dịch, 2: Ngừng giao dịch
}

export type OrderType = "M" | "B"; // M: Mua (Buy), B: Bán (Sell)
export type OrderMethod = "LO" | "ATO" | "ATC";
export type OrderStatus = "Hủy" | "Chưa" | "Một phần" | "Hết" | "Chờ";

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
  matchType: "Khớp 1 phần" | "Khớp hết";
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
