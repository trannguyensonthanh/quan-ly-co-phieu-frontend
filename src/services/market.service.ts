/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/market.service.ts
import TokenService from '@/services/token.service';
import apiHelper from './apiHelper';

const API_URL = '/market';
// Định nghĩa kiểu dữ liệu chi tiết thị trường của một mã cổ phiếu
export interface StockMarketDetail {
  MaCP: string; // Mã cổ phiếu
  TenCty: string; // Tên công ty
  GiaTC: number | null; // Giá tham chiếu
  GiaTran: number | null; // Giá trần
  GiaSan: number | null; // Giá sàn
  GiaKhopCuoi: number | null; // Giá khớp cuối
  KLKhopCuoi: number | null; // Khối lượng khớp cuối
  ThayDoi: number | null; // Thay đổi so với giá tham chiếu
  PhanTramThayDoi: number | null; // Phần trăm thay đổi
  TongKLKhop: number; // Tổng khối lượng khớp
  GiaDongCua?: number; // Giá đóng cửa
  GiaMoCua?: number; // Giá mở cửa
  GiaCaoNhat?: number; // Giá cao nhất
  GiaThapNhat?: number; // Giá thấp nhất
  GiaMua1?: number;
  KLMua1?: number;
  GiaMua2?: number;
  KLMua2?: number;
  GiaMua3?: number;
  KLMua3?: number;
  GiaBan1?: number;
  KLBan1?: number;
  GiaBan2?: number;
  KLBan2?: number;
  GiaBan3?: number;
  KLBan3?: number;
  TongKLDatMua?: number; // Tổng KL đặt mua chờ khớp
  TongKLDatBan: number; // Tổng KL đặt bán chờ khớp
  SoLuongPH?: number; // Số lượng cổ phiếu đang lưu hành
}
// Định nghĩa kiểu dữ liệu cho một dòng trong bảng giá (khớp với CoPhieuModel.getMarketBoardData)
export interface MarketBoardItem {
  // Export để component dùng
  MaCP: string;
  TenCty: string; // Thêm tên cty
  GiaTC: number | null; // Giá có thể null nếu chưa có dữ liệu
  GiaTran: number | null;
  GiaSan: number | null;
  GiaKhopCuoi: number | null;
  KLKhopCuoi?: number; // Khối lượng khớp cuối cùng
  ThayDoi: number | null; // +/- so với TC
  PhanTramThayDoi: number | null; // % thay đổi
  TongKLDatMua: number; // Tổng KL đặt mua chờ khớp
  TongKLDatBan: number; // Tổng KL đặt bán chờ khớp
  TongKLKhop: number; // Tổng KL khớp trong ngày
  SoLuongPH: number; // Số lượng cổ phiếu đang lưu hành
  GiaDongCua?: number;
  GiaMoCua?: number;
  GiaCaoNhat?: number;
  GiaThapNhat?: number;
  GiaMua1?: number;
  KLMua1?: number;
  GiaMua2?: number;
  KLMua2?: number;
  GiaMua3?: number;
  KLMua3?: number;
  GiaBan1?: number;
  KLBan1?: number;
  GiaBan2?: number;
  KLBan2?: number;
  GiaBan3?: number;
  KLBan3?: number;
  TongGTGD?: number;
  // Các trường khác từ DB
  DiaChi?: string;
}

export interface StockPriceHistoryItem {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type MarketBoardResponse = MarketBoardItem[];

/**
 * Lấy dữ liệu Bảng giá điện tử.
 * Yêu cầu user đã đăng nhập (NV hoặc NDT).
 */
const getMarketBoard = (): Promise<MarketBoardResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/board`, token);
};

/**
 * Lấy dữ liệu thị trường chi tiết của một mã cổ phiếu.
 * @param maCP Mã cổ phiếu.
 */
const getStockMarketData = (maCP: string): Promise<any> => {
  if (!maCP) return Promise.reject(new Error('Mã CP là bắt buộc'));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/stocks/${maCP}`, token);
};

/**
 * NEW FUNCTION: Lấy dữ liệu lịch sử giá của một cổ phiếu để vẽ biểu đồ.
 * @param maCP Mã cổ phiếu.
 * @param params Các tham số truy vấn như resolution, from, to.
 */
const getStockPriceHistory = (
  maCP: string,
  params: { resolution: string; from: number; to: number }
): Promise<StockPriceHistoryItem[]> => {
  if (!maCP) return Promise.reject(new Error('Mã CP là bắt buộc'));
  const token = TokenService.getLocalAccessToken();
  // apiHelper.get đã hỗ trợ truyền params, sẽ tự động chuyển thành query string
  return apiHelper.get(`${API_URL}/stocks/${maCP}/history`, token, params);
};

const MarketService = {
  getMarketBoard,
  getStockMarketData,
  getStockPriceHistory,
};

export default MarketService;
