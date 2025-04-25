/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/portfolio.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

// Import các kiểu dữ liệu đã định nghĩa ở investor.service nếu dùng chung
import type { TaiKhoanNganHang, PortfolioResponse } from "./investor.service"; // Hoặc định nghĩa lại nếu cần

const API_URL = "/portfolio"; // Endpoint dành cho NDT tự xem

/**
 * Lấy số dư các tài khoản ngân hàng của NDT đang đăng nhập.
 */
const getMyBalances = (): Promise<TaiKhoanNganHang[]> => {
  const token = TokenService.getLocalAccessToken();
  // Không cần truyền MaNDT, backend tự lấy từ token
  return apiHelper.get(`${API_URL}/balances`, token);
};

/**
 * Lấy danh mục cổ phiếu của NDT đang đăng nhập.
 */
const getMyPortfolio = (): Promise<PortfolioResponse> => {
  // Không cần truyền MaNDT
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/stocks`, token);
};

/**
 * Lấy số lượng sở hữu của một mã cổ phiếu cụ thể cho NĐT đang đăng nhập.
 * @param maCP Mã cổ phiếu cần kiểm tra.
 */
const getMyStockQuantity = (maCP: string): Promise<any> => {
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
  return apiHelper.get(`${API_URL}/stocks/${maCP}/quantity`);
};

const PortfolioService = {
  getMyBalances,
  getMyPortfolio,
  getMyStockQuantity,
};

export default PortfolioService;
