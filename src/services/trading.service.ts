// src/services/trading.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

const API_URL = "/trading"; // Endpoint đặt lệnh/hủy lệnh

// Định nghĩa kiểu dữ liệu payload để đặt lệnh
export interface PlaceOrderPayload {
  MaTK: string; // Tài khoản dùng để đặt lệnh/nhận tiền
  MaCP: string; // Mã cổ phiếu
  SoLuong: number; // Số lượng đặt
  Gia: number; // Giá đặt
  LoaiLenh: "LO" | "ATO" | "ATC"; // Loại lệnh
  transactionPassword?: string;
}

// Định nghĩa kiểu dữ liệu trả về khi đặt lệnh thành công (khớp với backend)
export interface PlacedOrderInfo {
  MaGD: number;
  NgayGD: string | Date;
  LoaiGD: "M" | "B";
  LoaiLenh: "LO" | "ATO" | "ATC";
  SoLuong: number;
  MaCP: string;
  Gia: number;
  MaTK: string;
  TrangThai: string; // Thường là 'Chờ'
}

export interface PlaceOrderResponse {
  message: string;
  order: PlacedOrderInfo;
}

// Kiểu trả về khi hủy lệnh thành công
export interface CancelOrderResponse {
  message: string;
}

/**
 * Đặt lệnh Mua.
 * @param orderData Dữ liệu lệnh mua.
 */
const placeBuyOrder = (
  orderData: PlaceOrderPayload
): Promise<PlaceOrderResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/buy`, orderData, token);
};

/**
 * Đặt lệnh Bán.
 * @param orderData Dữ liệu lệnh bán.
 */
const placeSellOrder = (
  orderData: PlaceOrderPayload
): Promise<PlaceOrderResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/sell`, orderData, token);
};

/**
 * Hủy một lệnh đặt đang chờ hoặc khớp một phần.
 * @param maGD Mã giao dịch (lệnh đặt) cần hủy.
 */
const cancelOrder = (maGD: number): Promise<CancelOrderResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!maGD || maGD <= 0)
    return Promise.reject(new Error("Mã giao dịch không hợp lệ"));
  return apiHelper.delete(`${API_URL}/orders/${maGD}`, token);
};

// Export service object
const TradingService = {
  placeBuyOrder,
  placeSellOrder,
  cancelOrder,
};

export default TradingService;
