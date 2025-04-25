/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/stock.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

const API_URL = "/cophieu";

// Định nghĩa kiểu dữ liệu cho Cổ phiếu (khớp model backend)
export interface CoPhieu {
  // Export để có thể dùng ở component
  MaCP: string;
  TenCty: string;
  DiaChi: string;
  SoLuongPH: number;
  Status?: number; // 0: Chưa niêm yết, 1: Đang giao dịch, 2: Ngừng giao dịch
}

// Kiểu dữ liệu để tạo mới cổ phiếu
export type CreateCoPhieuPayload = Omit<CoPhieu, "">; // Có thể dùng thẳng CoPhieu

// Kiểu dữ liệu để cập nhật cổ phiếu (không có MaCP)
export type UpdateCoPhieuPayload = Omit<CoPhieu, "MaCP">;

// Kiểu dữ liệu trả về từ API lấy sao kê lệnh CP
interface StockOrderStatementItem {
  MaGD: number;
  NgayGD: string | Date;
  LoaiGD: "M" | "B";
  LoaiLenh: "LO" | "ATO" | "ATC";
  SoLuongDat: number;
  GiaDat: number;
  MaTK: string;
  TrangThai: string;
  TongSoLuongKhop: number;
  GiaKhopTrungBinh?: number | null;
  NgayGioKhopCuoi?: string | Date | null;
}
export type StockOrderStatementResponse = StockOrderStatementItem[];

/**
 * Lấy danh sách tất cả cổ phiếu đang giao dịch.
 */
const getAllStocks = (): Promise<CoPhieu[]> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(API_URL, token);
};

/**
 * Lấy thông tin chi tiết một cổ phiếu.
 * @param maCP Mã cổ phiếu.
 */
const getStockById = (maCP: string): Promise<CoPhieu> => {
  const token = TokenService.getLocalAccessToken();
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));

  return apiHelper.get(`${API_URL}/${maCP}`, token);
};

/**
 * Tạo mới một cổ phiếu.
 * @param stockData Dữ liệu cổ phiếu mới.
 */
const createStock = (stockData: CreateCoPhieuPayload): Promise<CoPhieu> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(API_URL, stockData, token);
};

/**
 * Cập nhật thông tin một cổ phiếu.
 * @param maCP Mã cổ phiếu cần cập nhật.
 * @param stockData Dữ liệu cập nhật (không gồm MaCP).
 */
const updateStock = (
  maCP: string,
  stockData: UpdateCoPhieuPayload
): Promise<CoPhieu> => {
  const token = TokenService.getLocalAccessToken();
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
  return apiHelper.put(`${API_URL}/${maCP}`, stockData, token);
};

/**
 * Xóa một cổ phiếu.
 * @param maCP Mã cổ phiếu cần xóa.
 */
const deleteStock = (maCP: string): Promise<{ message: string }> => {
  const token = TokenService.getLocalAccessToken();
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
  // Kiểu trả về có thể chỉ là message { message: '...' }
  return apiHelper.delete(`${API_URL}/${maCP}`, token);
};

/**
 * Lấy sao kê lệnh của một mã cổ phiếu trong khoảng thời gian.
 * @param maCP Mã cổ phiếu.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getStockOrders = (
  maCP: string,
  tuNgay: string,
  denNgay: string
): Promise<StockOrderStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!maCP || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã CP, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(`${API_URL}/${maCP}/orders`, token, params);
};

/**
 * Lấy danh sách tất cả cổ phiếu (dành cho Admin).
 */
const getAllStocksForAdmin = (): Promise<CoPhieu[]> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/admin/all`, token);
};

/**
 * Ngừng giao dịch một cổ phiếu (chuyển Status từ 1 -> 2).
 * @param maCP Mã cổ phiếu cần ngừng giao dịch.
 */
const delistStock = (maCP: string): Promise<CoPhieu> => {
  const token = TokenService.getLocalAccessToken();
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
  return apiHelper.put(`${API_URL}/${maCP}/delist`, {}, token);
};

/**
 * Niêm yết một cổ phiếu (chuyển Status từ 0 -> 1, thêm giá tham chiếu ban đầu).
 * @param maCP Mã cổ phiếu cần niêm yết.
 * @param initialGiaTC Giá tham chiếu ban đầu.
 */
const listStock = (maCP: string, initialGiaTC: number): Promise<CoPhieu> => {
  const token = TokenService.getLocalAccessToken();
  console.log("listStock", maCP, initialGiaTC);
  if (!maCP || initialGiaTC == null)
    return Promise.reject(
      new Error("Mã CP và Giá tham chiếu ban đầu là bắt buộc")
    );
  return apiHelper.put(`${API_URL}/${maCP}/list`, { initialGiaTC }, token);
};

/**
 * Lấy thông tin về hành động undo cuối cùng của một cổ phiếu.
 * @param maCP Mã cổ phiếu cần lấy thông tin undo.
 */
const getLatestUndoInfo = (
  maCP: string
): Promise<{ action: string; timestamp: string }> => {
  const token = TokenService.getLocalAccessToken();
  if (!maCP) return Promise.reject(new Error("Mã CP là bắt buộc"));
  return apiHelper.get(`${API_URL}/${maCP}/undo-info`, token);
};

/**
 * Lấy lịch sử giá chi tiết của một mã cổ phiếu.
 * @param maCP Mã cổ phiếu.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getStockPriceHistory = (
  maCP: string,
  tuNgay: string,
  denNgay: string
): Promise<any> => {
  if (!maCP || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã CP, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  const token = TokenService.getLocalAccessToken();
  // Dùng apiHelper vì cần đăng nhập
  return apiHelper.get(`${API_URL}/${maCP}/history`, token, params);
};

// Export service object
const StockService = {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStockOrders,
  getAllStocksForAdmin,
  delistStock,
  listStock,
  getLatestUndoInfo,
  getStockPriceHistory,
};

export default StockService;
