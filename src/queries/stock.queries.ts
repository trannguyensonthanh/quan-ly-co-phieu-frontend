/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/stock.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StockService from "../services/stock.service";
import MarketService from "../services/market.service"; // Import MarketService
import { APIError } from "../services/apiHelper";
// Import kiểu dữ liệu
import type {
  CoPhieu,
  CreateCoPhieuPayload,
  UpdateCoPhieuPayload,
  StockOrderStatementResponse,
} from "../services/stock.service";
import type { MarketBoardResponse } from "../services/market.service";
import type { SimpleMessageResponse } from "../services/admin.service"; // Dùng lại kiểu message chung
import AdminService from "../services/admin.service";

// --- Query Keys ---
const stockKeys = {
  all: ["stocks"] as const, // Key cho danh sách tất cả cổ phiếu
  lists: () => [...stockKeys.all, "list"] as const,
  details: () => [...stockKeys.all, "detail"] as const,
  detail: (maCP: string | undefined) => [...stockKeys.details(), maCP] as const, // Key cho chi tiết 1 CP
  orders: (maCP: string | undefined) =>
    [...stockKeys.all, "orders", maCP] as const, // Key cho sao kê lệnh của CP
  history: (maCP: string | undefined) =>
    [...stockKeys.all, "history", maCP] as const,
};

export const marketKeys = {
  all: ["market"] as const,
  board: () => [...marketKeys.all, "board"] as const, // Key cho bảng giá
  stockDetails: () => [...marketKeys.all, "stockDetails"] as const,
  stockDetail: (maCP: string | undefined) =>
    [...marketKeys.stockDetails(), maCP] as const,
};

// --- Queries ---

/**
 * Hook để lấy danh sách tất cả cổ phiếu đang giao dịch.
 */
export const useGetAllStocksQuery = () => {
  return useQuery<CoPhieu[], Error>({
    queryKey: stockKeys.lists(),
    queryFn: StockService.getAllStocks,
    staleTime: 1000 * 60 * 10, // Danh sách CP ít thay đổi hơn (10 phút)
  });
};

/**
 * Hook để lấy thông tin chi tiết một cổ phiếu.
 * @param maCP Mã cổ phiếu (có thể là undefined ban đầu).
 */
export const useGetStockByIdQuery = (maCP: string | undefined) => {
  return useQuery<CoPhieu, Error>({
    queryKey: stockKeys.detail(maCP),
    queryFn: () => {
      if (!maCP) return Promise.reject(new Error("Mã CP không được trống")); // Bảo vệ queryFn
      return StockService.getStockById(maCP);
    },
    enabled: !!maCP, // Chỉ chạy query khi maCP có giá trị
    staleTime: 1000 * 60 * 15, // Chi tiết CP còn ít thay đổi hơn
  });
};

/**
 * Hook để lấy sao kê lệnh của một mã cổ phiếu (dùng cho Admin).
 * @param maCP Mã cổ phiếu.
 * @param tuNgay Ngày bắt đầu.
 * @param denNgay Ngày kết thúc.
 */
export const useGetStockOrdersQuery = (
  maCP: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isValid = !!maCP && !!tuNgay && !!denNgay; // Check if all params are valid
  return useQuery<StockOrderStatementResponse, Error>({
    // Key bao gồm cả ngày để phân biệt các khoảng thời gian khác nhau
    queryKey: [...stockKeys.orders(maCP), { tuNgay, denNgay }],
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new Error("Mã CP, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
        );
      return StockService.getStockOrders(
        maCP as string,
        tuNgay as string,
        denNgay as string
      ); // Ép kiểu vì đã check isValid
    },
    enabled: isValid, // Chỉ chạy khi tất cả tham số hợp lệ
    staleTime: 1000 * 30, // Sao kê có thể thay đổi, stale time ngắn (30s)
  });
};

/**
 * Hook để lấy dữ liệu bảng giá điện tử.
 */
export const useMarketBoardQuery = (options?: {
  refetchInterval?: number | false;
}) => {
  return useQuery<MarketBoardResponse, Error>({
    queryKey: marketKeys.board(),
    queryFn: MarketService.getMarketBoard,
    staleTime: 1000 * 5, // Dữ liệu bảng giá thay đổi rất nhanh (5 giây)
    refetchInterval: options?.refetchInterval ?? 1000 * 15, // Tự động fetch lại sau mỗi 15 giây (hoặc theo options)
    // refetchOnWindowFocus: true, // Có thể bật lại cho bảng giá
  });
};

// --- Mutations ---

/**
 * Hook để tạo mới một cổ phiếu (Admin).
 */
export const useCreateStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CoPhieu, Error, CreateCoPhieuPayload>({
    mutationFn: StockService.createStock,
    onSuccess: (newStock) => {
      console.log("Stock created:", newStock);
      // Vô hiệu hóa query lấy danh sách để cập nhật UI
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      // Có thể setQueryData cho cache chi tiết nếu muốn tối ưu
      queryClient.setQueryData(stockKeys.detail(newStock.MaCP), newStock);
      // Lấy lại toàn bộ lịch sử hoàn tác
      queryClient.invalidateQueries({ queryKey: ["admin", "undo-logs"] });
    },
    onError: (error: any) => {
      console.error("Create stock failed:", error);
      // Hiển thị lỗi
    },
  });
};

/**
 * Hook để cập nhật một cổ phiếu (Admin).
 */
export const useUpdateStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CoPhieu,
    Error,
    { maCP: string; stockData: UpdateCoPhieuPayload }
  >({
    mutationFn: ({ maCP, stockData }) =>
      StockService.updateStock(maCP, stockData),
    onSuccess: (updatedStock, variables) => {
      // variables chứa { maCP, stockData } đã gửi lên
      console.log("Stock updated:", updatedStock);
      // Vô hiệu hóa cả danh sách và chi tiết để đảm bảo dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockKeys.detail(variables.maCP),
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "undo-logs"] });
      // Hoặc cập nhật cache trực tiếp
      // queryClient.setQueryData(stockKeys.detail(variables.maCP), updatedStock);
    },
    onError: (error: any) => {
      console.error("Update stock failed:", error);
      // Hiển thị lỗi
    },
  });
};

/**
 * Hook để xóa một cổ phiếu (Admin).
 */
export const useDeleteStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { maCP: string }>({
    mutationFn: ({ maCP }) => StockService.deleteStock(maCP),
    onSuccess: (data, variables) => {
      console.log("Stock deleted:", variables.maCP, data.message);
      // Vô hiệu hóa cả danh sách và chi tiết
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockKeys.detail(variables.maCP),
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "undo-logs"] });
      // Hoặc xóa cache chi tiết
      // queryClient.removeQueries({ queryKey: stockKeys.detail(variables.maCP) });
    },
    onError: (error: any) => {
      console.error("Delete stock failed:", error);
      // Hiển thị lỗi
    },
  });
};

/**
 * Hook để lấy danh sách tất cả cổ phiếu (dành cho Admin).
 */
export const useGetAllStocksForAdminQuery = () => {
  return useQuery<any[], Error>({
    queryKey: stockKeys.lists(),
    queryFn: () => StockService.getAllStocksForAdmin(),
    staleTime: 1000 * 60 * 10, // Danh sách CP ít thay đổi hơn (10 phút)
  });
};

/**
 * Hook để ngừng giao dịch một cổ phiếu (Admin).
 */
export const useDelistStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CoPhieu, Error, { maCP: string }>({
    mutationFn: ({ maCP }) => StockService.delistStock(maCP),
    onSuccess: (delistedStock, variables) => {
      console.log("Stock delisted:", delistedStock);
      // Vô hiệu hóa cả danh sách và chi tiết để đảm bảo dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockKeys.detail(variables.maCP),
      });
      // Hoặc cập nhật cache trực tiếp nếu cần
      queryClient.setQueryData(stockKeys.detail(variables.maCP), delistedStock);
      queryClient.invalidateQueries({ queryKey: ["admin", "undo-logs"] });
    },
    onError: (error: any) => {
      console.error("Delist stock failed:", error);
      // Hiển thị lỗi
    },
  });
};

/**
 * Hook để niêm yết một cổ phiếu (Admin).
 */
export const useListStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CoPhieu, Error, { maCP: string; initialGiaTC: number }>({
    mutationFn: ({ maCP, initialGiaTC }) =>
      StockService.listStock(maCP, initialGiaTC),
    onSuccess: (listedStock, variables) => {
      console.log("Stock listed:", listedStock);
      // Vô hiệu hóa cả danh sách và chi tiết để đảm bảo dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: stockKeys.detail(variables.maCP),
      });
      // Hoặc cập nhật cache trực tiếp nếu cần
      queryClient.setQueryData(stockKeys.detail(variables.maCP), listedStock);
      queryClient.invalidateQueries({ queryKey: ["admin", "undo-logs"] });
    },
    onError: (error: any) => {
      console.error("List stock failed:", error);
      // Hiển thị lỗi
    },
  });
};
/**
 * Hook để hoàn tác hành động cuối cùng trên một cổ phiếu (Admin).
 */
export const useUndoLastActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, void>({
    mutationFn: () => AdminService.undoLastCoPhieuAction(),
    onSuccess: (revertedStock) => {
      console.log("Last action undone for stock:", revertedStock);
      // Vô hiệu hóa cả danh sách và chi tiết để đảm bảo dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      if (revertedStock.MaCP) {
        queryClient.invalidateQueries({
          queryKey: stockKeys.detail(revertedStock.MaCP),
        });
        // Hoặc cập nhật cache trực tiếp nếu cần
        queryClient.setQueryData(
          stockKeys.detail(revertedStock.MaCP),
          revertedStock
        );
      }
    },
    onError: (error: any) => {
      console.error("Undo last action failed:", error);
      // Hiển thị lỗi
    },
  });
};

/**
 * Hook để lấy thông tin về hành động undo cuối cùng của một cổ phiếu.
 * @param maCP Mã cổ phiếu cần lấy thông tin undo.
 */
export const useGetLatestUndoInfoQuery = (maCP: string | undefined) => {
  return useQuery<{ action: string; timestamp: string }, Error>({
    queryKey: ["stocks", "undo-info", maCP],
    queryFn: () => {
      if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
      return StockService.getLatestUndoInfo(maCP);
    },
    enabled: !!maCP, // Chỉ chạy query khi maCP có giá trị
    staleTime: 1000 * 60 * 5, // Dữ liệu ít thay đổi (5 phút)
  });
};

/**
 * Hook để lấy toàn bộ lịch sử hoàn tác (dành cho Admin).
 */
export const useGetAllUndoLogsQuery = (enabled: boolean = true) => {
  return useQuery<any[], Error>({
    queryKey: ["admin", "undo-logs"],
    queryFn: () => AdminService.getAllUndoLogs(),
    staleTime: 1000 * 60 * 10, // Dữ liệu ít thay đổi (10 phút)
    enabled, // Chỉ chạy query khi enabled là true
  });
};

/**
 * Hook để lấy lịch sử giá chi tiết của một mã cổ phiếu.
 * @param maCP Mã cổ phiếu.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
export const useGetStockPriceHistoryQuery = (
  maCP: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isValid = !!maCP && !!tuNgay && !!denNgay;
  const range = { tuNgay, denNgay };
  return useQuery<any, APIError>({
    // Key bao gồm mã CP và khoảng ngày
    queryKey: [...stockKeys.history(maCP), range],
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new APIError("Mã CP, Ngày bắt đầu, Ngày kết thúc là bắt buộc", 400)
        );
      // Ép kiểu vì đã kiểm tra isValid
      return StockService.getStockPriceHistory(
        maCP as string,
        tuNgay as string,
        denNgay as string
      );
    },
    enabled: isValid, // Chỉ chạy khi đủ tham số
    staleTime: 1000 * 60 * 60, // Dữ liệu lịch sử thường không đổi -> staleTime dài (1 giờ)
    // Cache cũng có thể giữ lâu hơn (2 giờ)
  });
};

/**
 * Hook để lấy dữ liệu thị trường chi tiết của một mã cổ phiếu.
 * @param maCP Mã cổ phiếu.
 */
export const useGetStockMarketDataQuery = (maCP: string | undefined) => {
  return useQuery<any, APIError>({
    queryKey: marketKeys.stockDetail(maCP), // <<< Dùng key mới
    queryFn: () => {
      if (!maCP) return Promise.reject(new APIError("Mã CP là bắt buộc", 400));
      return MarketService.getStockMarketData(maCP); // <<< Gọi service mới
    },
    enabled: !!maCP, // Chỉ chạy khi có maCP
    staleTime: 1000 * 10, // Dữ liệu thay đổi thường xuyên hơn chi tiết tĩnh (10 giây)
    refetchInterval: 1000 * 30, // Có thể fetch lại định kỳ (30 giây) nếu đang xem chi tiết
    // refetchOnWindowFocus: true, // Bật lại nếu muốn cập nhật khi focus
  });
};
