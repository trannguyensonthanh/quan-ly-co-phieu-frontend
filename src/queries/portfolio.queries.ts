/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/portfolio.queries.ts
import { useQuery } from "@tanstack/react-query";
import PortfolioService from "../services/portfolio.service";
import TokenService from "../services/token.service"; // Để kiểm tra trạng thái đăng nhập

// Import kiểu dữ liệu dùng chung
import type {
  TaiKhoanNganHang,
  PortfolioResponse,
} from "../services/investor.service"; // Tái sử dụng
import { APIError } from "@/services/apiHelper";

// --- Query Keys ---
export const portfolioKeys = {
  all: ["portfolio"] as const, // Base key cho portfolio của user hiện tại
  balances: () => [...portfolioKeys.all, "balances"] as const,
  stocks: () => [...portfolioKeys.all, "stocks"] as const,
  stockQuantity: (maCP: string | undefined) =>
    [...portfolioKeys.stocks(), maCP, "quantity"] as const,
};

// --- Queries (Dành cho NDT tự xem) ---

/**
 * Hook lấy số dư các tài khoản ngân hàng của NDT đang đăng nhập.
 */
export const useGetMyBalancesQuery = () => {
  const isLoggedIn = !!TokenService.getLocalAccessToken(); // Chỉ fetch khi đã đăng nhập
  return useQuery<TaiKhoanNganHang[], Error>({
    queryKey: portfolioKeys.balances(),
    queryFn: PortfolioService.getMyBalances,
    enabled: isLoggedIn,
    staleTime: 1000 * 60, // Số dư có thể thay đổi (1 phút)
  });
};

/**
 * Hook lấy danh mục cổ phiếu của NDT đang đăng nhập.
 */
export const useGetMyPortfolioQuery = () => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();
  return useQuery<PortfolioResponse, Error>({
    queryKey: portfolioKeys.stocks(),
    queryFn: PortfolioService.getMyPortfolio,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 2, // Danh mục thay đổi sau khớp lệnh (2 phút)
  });
};

/**
 * Hook để lấy số lượng sở hữu của một mã cổ phiếu cụ thể cho NĐT đang đăng nhập.
 * @param maCP Mã cổ phiếu (có thể undefined ban đầu).
 */
export const useGetMyStockQuantityQuery = (maCP: string | undefined) => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();

  return useQuery<any, APIError>({
    queryKey: portfolioKeys.stockQuantity(maCP), // <<< Dùng key mới
    queryFn: () => {
      if (!maCP) return Promise.reject(new APIError("Mã CP là bắt buộc", 400));
      return PortfolioService.getMyStockQuantity(maCP); // <<< Gọi service mới
    },
    enabled: isLoggedIn && !!maCP, // Chỉ chạy khi đăng nhập và có maCP
    staleTime: 1000 * 30, // Số lượng có thể thay đổi khá nhanh sau khớp lệnh (30s)
    // refetchOnWindowFocus: true, // Có thể bật lại nếu cần cập nhật khi focus
  });
};
