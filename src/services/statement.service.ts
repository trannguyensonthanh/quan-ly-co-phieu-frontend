/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/statement.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

const API_URL = "/statement"; // Endpoint sao kê cho NDT

// --- Định nghĩa Kiểu Dữ liệu Response (Export để tái sử dụng) ---

// Sao kê lệnh đặt (A.4)
export interface OrderStatementItem {
  // Kiểu dữ liệu giống API /nhadautu/.../orders
  MaGD: number;
  NgayGD: string | Date;
  LoaiGD: "M" | "B";
  LoaiLenh: "LO" | "ATO" | "ATC";
  SoLuongDat: number;
  MaCP: string;
  GiaDat: number;
  MaTK: string;
  TrangThai: string;
  TongSoLuongKhop: number;
  GiaKhopTrungBinh?: number | null;
  // Thêm các trường khác nếu backend trả về
}
export type OrderStatementResponse = OrderStatementItem[];

// Sao kê lệnh khớp (A.5)
export interface MatchedOrderStatementItem {
  // Kiểu dữ liệu giống API /nhadautu/.../matched-orders
  MaLK: number;
  MaGD: number;
  NgayGioKhop: string | Date;
  SoLuongKhop: number;
  GiaKhop: number;
  KieuKhop?: string | null;
  LoaiGD: "M" | "B"; // Lấy từ join LENHDAT
  MaCP: string; // Lấy từ join LENHDAT
  MaTK: string; // Lấy từ join LENHDAT
}
export type MatchedOrderStatementResponse = MatchedOrderStatementItem[];

// Sao kê tiền mặt (B.2)
export interface CashFlowEvent {
  // Kiểu dữ liệu giống API /nhadautu/.../cash
  Ngay: string | Date;
  SoTienPhatSinh: number; // Âm hoặc dương
  LyDo: string;
  MaGD?: number | null; // Mã GD liên quan (nếu có)
  MaTK: string; // Mã TK bị ảnh hưởng
}
export interface CashStatementResponse {
  // API có thể trả về thêm opening/closing balance
  openingBalance?: number | null;
  transactions: CashFlowEvent[];
  closingBalance?: number | null;
}

// --- Các hàm Service ---

/**
 * Lấy sao kê giao dịch lệnh của NDT đang đăng nhập.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getMyOrderStatement = (
  tuNgay: string,
  denNgay: string
): Promise<OrderStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!tuNgay || !denNgay)
    return Promise.reject(
      new Error("Ngày bắt đầu và Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(`${API_URL}/orders`, token, params);
};

/**
 * Lấy sao kê lệnh khớp của NDT đang đăng nhập.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getMyMatchedOrderStatement = (
  tuNgay: string,
  denNgay: string
): Promise<MatchedOrderStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!tuNgay || !denNgay)
    return Promise.reject(
      new Error("Ngày bắt đầu và Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(`${API_URL}/matched-orders`, token, params);
};

/**
 * Lấy sao kê tiền mặt của NDT đang đăng nhập.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getMyCashStatement = (
  tuNgay: string,
  denNgay: string
): Promise<CashStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!tuNgay || !denNgay)
    return Promise.reject(
      new Error("Ngày bắt đầu và Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(`${API_URL}/cash`, token, params);
};

/**
 * Lấy sao kê giao dịch lệnh của NĐT đang đăng nhập CHỈ TRONG NGÀY HÔM NAY.
 */
const getMyOrdersToday = (): Promise<any> => {
  // Gọi endpoint mới không cần tham số ngày
  return apiHelper.get(`${API_URL}/orders/today`);
};

/**
 * Lấy sao kê lệnh khớp của NĐT đang đăng nhập CHỈ TRONG NGÀY HÔM NAY.
 */
const getMyMatchedOrdersToday = (): Promise<MatchedOrderStatementResponse> => {
  // Gọi endpoint mới không cần tham số ngày
  return apiHelper.get(`${API_URL}/matched-orders/today`);
};

/**
 * Lấy sao kê tài khoản tiền chi tiết của một tài khoản cụ thể.
 * @param maTK Mã tài khoản cần lấy sao kê.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getAccountCashStatementDetail = (
  maTK: string,
  tuNgay: string,
  denNgay: string
): Promise<any> => {
  const token = TokenService.getLocalAccessToken();
  if (!maTK || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã tài khoản, Ngày bắt đầu và Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(
    `${API_URL}/accounts/${maTK}/cash-statement-detail`,
    token,
    params
  );
};

// Export service object
const StatementService = {
  getMyOrderStatement,
  getMyMatchedOrderStatement,
  getMyCashStatement,
  getMyOrdersToday,
  getMyMatchedOrdersToday,
  getAccountCashStatementDetail,
};

export default StatementService;
