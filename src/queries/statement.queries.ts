/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/statement.queries.ts
import { useQuery } from "@tanstack/react-query";
import StatementService from "../services/statement.service";
import TokenService from "../services/token.service";

// Import kiểu dữ liệu (đã export từ statement.service.ts)
import type {
  OrderStatementResponse,
  MatchedOrderStatementResponse,
  CashStatementResponse,
} from "../services/statement.service";
import { APIError } from "@/services/apiHelper";

// --- Query Keys ---
export const statementKeys = {
  all: ["statements"] as const, // Base key cho sao kê của user hiện tại
  orders: (range: { tuNgay?: string; denNgay?: string }) =>
    [...statementKeys.all, "orders", range] as const,
  matched: (range: { tuNgay?: string; denNgay?: string }) =>
    [...statementKeys.all, "matched", range] as const,
  cash: (range: { tuNgay?: string; denNgay?: string }) =>
    [...statementKeys.all, "cash", range] as const,
  ordersToday: () => [...statementKeys.all, "orders", "today"] as const,
  matchedToday: () => [...statementKeys.all, "matched", "today"] as const,
};

// --- Queries (Dành cho NDT tự xem) ---

// Hàm helper chung cho các query sao kê theo ngày
const useMyStatementQuery = <T>(
  queryKeyFn: (range: {
    tuNgay?: string;
    denNgay?: string;
  }) => readonly unknown[],
  queryFnService: (tuNgay: string, denNgay: string) => Promise<T>,
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();
  const isValid = isLoggedIn && !!tuNgay && !!denNgay;
  const range = { tuNgay, denNgay };

  return useQuery<T, Error>({
    queryKey: queryKeyFn(range),
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new Error("Ngày bắt đầu và Ngày kết thúc là bắt buộc")
        );
      // Ép kiểu vì đã kiểm tra isValid
      return queryFnService(tuNgay as string, denNgay as string);
    },
    enabled: isValid, // Chỉ chạy khi đăng nhập và có ngày hợp lệ
    staleTime: 1000 * 60, // Dữ liệu sao kê ít thay đổi (1 phút)
  });
};

/** Hook lấy sao kê lệnh đặt của NDT đang đăng nhập */
export const useGetMyOrderStatementQuery = (
  tuNgay: string | undefined,
  denNgay: string | undefined
) =>
  useMyStatementQuery<OrderStatementResponse>(
    statementKeys.orders,
    StatementService.getMyOrderStatement,
    tuNgay,
    denNgay
  );

/** Hook lấy sao kê lệnh khớp của NDT đang đăng nhập */
export const useGetMyMatchedStatementQuery = (
  tuNgay: string | undefined,
  denNgay: string | undefined
) =>
  useMyStatementQuery<MatchedOrderStatementResponse>(
    statementKeys.matched,
    StatementService.getMyMatchedOrderStatement,
    tuNgay,
    denNgay
  );

/** Hook lấy sao kê tiền mặt của NDT đang đăng nhập */
export const useGetMyCashStatementQuery = (
  tuNgay: string | undefined,
  denNgay: string | undefined
) =>
  useMyStatementQuery<CashStatementResponse>(
    statementKeys.cash,
    StatementService.getMyCashStatement,
    tuNgay,
    denNgay
  );

/** Hook lấy sao kê lệnh đặt của NDT đang đăng nhập trong ngày hôm nay */
export const useGetMyOrdersTodayQuery = (options?: {
  refetchInterval?: number | false;
}) => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();

  return useQuery<OrderStatementResponse, APIError>({
    queryKey: statementKeys.ordersToday(), // <<< Dùng key mới
    queryFn: StatementService.getMyOrdersToday, // <<< Gọi service mới
    enabled: isLoggedIn, // Chỉ chạy khi đăng nhập
    staleTime: 1000 * 15, // Dữ liệu lệnh trong ngày thay đổi khá nhanh (15s)
    refetchInterval: options?.refetchInterval ?? 1000 * 30, // Tự fetch lại mỗi 30s (tùy chọn)
  });
};

/* Hook lấy sao kê lệnh khớp của NĐT đang đăng nhập trong ngày hôm nay */
export const useGetMyMatchedOrdersTodayQuery = (options?: {
  refetchInterval?: number | false;
}) => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();

  return useQuery<MatchedOrderStatementResponse, APIError>({
    queryKey: statementKeys.matchedToday(), // <<< Dùng key mới
    queryFn: StatementService.getMyMatchedOrdersToday, // <<< Gọi service mới
    enabled: isLoggedIn,
    staleTime: 1000 * 10, // Dữ liệu khớp lệnh thay đổi nhanh hơn lệnh đặt (10s)
    refetchInterval: options?.refetchInterval ?? 1000 * 20, // Tự fetch lại mỗi 20s
  });
};

/** Hook lấy sao kê tài khoản tiền chi tiết của một tài khoản cụ thể */
export const useGetAccountCashStatementDetailQuery = (
  maTK: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();
  const isValid = isLoggedIn && !!maTK && !!tuNgay && !!denNgay;
  const range = { maTK, tuNgay, denNgay };

  return useQuery<any, APIError>({
    queryKey: ["accountCashStatementDetail", range],
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new Error("Mã tài khoản, Ngày bắt đầu và Ngày kết thúc là bắt buộc")
        );
      return StatementService.getAccountCashStatementDetail(
        maTK as string,
        tuNgay as string,
        denNgay as string
      );
    },
    enabled: isValid, // Chỉ chạy khi đăng nhập và có thông tin hợp lệ
    staleTime: 1000 * 60, // Dữ liệu ít thay đổi (1 phút)
  });
};

/** Hook lấy thông tin tất cả tài khoản ngân hàng của NĐT đang đăng nhập */
export const useGetMyBankAccountsQuery = () => {
  const isLoggedIn = !!TokenService.getLocalAccessToken();

  return useQuery<any, APIError>({
    queryKey: ["myBankAccounts"],
    queryFn: () => {
      if (!isLoggedIn) {
        return Promise.reject(new Error("Người dùng chưa đăng nhập"));
      }
      return StatementService.getMyBankAccounts();
    },
    enabled: isLoggedIn, // Chỉ chạy khi đăng nhập
    staleTime: 1000 * 60 * 5, // Dữ liệu ít thay đổi (5 phút)
  });
};
