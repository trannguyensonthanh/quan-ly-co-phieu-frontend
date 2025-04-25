/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/market.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

const API_URL = "/market";

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
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/stocks/${maCP}`, token);
};

const MarketService = {
  getMarketBoard,
  getStockMarketData,
};

export default MarketService;
