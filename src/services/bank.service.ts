// src/services/bank.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

// Định nghĩa kiểu dữ liệu Ngân hàng (khớp với backend)
export interface Bank {
  MaNH: string;
  TenNH: string;
  DiaChi?: string | null;
  Phone?: string | null;
  Email?: string | null;
}

// Kiểu dữ liệu để tạo mới (có thể dùng Bank trực tiếp)
export type CreateBankPayload = Bank;

// Kiểu dữ liệu để cập nhật (không cần MaNH trong body)
export type UpdateBankPayload = Omit<Bank, "MaNH">;

// Kiểu trả về chung khi xóa thành công
export interface DeleteResponse {
  message: string;
}

const API_URL = "/banks"; // Endpoint ngân hàng

/** Lấy danh sách tất cả ngân hàng */
const getAllBanks = (): Promise<Bank[]> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(API_URL, token);
};

/** Lấy chi tiết một ngân hàng */
const getBankById = (maNH: string): Promise<Bank> => {
  if (!maNH) return Promise.reject(new Error("Mã Ngân hàng là bắt buộc"));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/${maNH}`, token);
};

/** Tạo mới một ngân hàng */
const createBank = (bankData: CreateBankPayload): Promise<Bank> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(API_URL, bankData, token);
};

/** Cập nhật thông tin ngân hàng */
const updateBank = (
  maNH: string,
  bankData: Partial<UpdateBankPayload>
): Promise<Bank> => {
  // Partial cho phép chỉ gửi các trường cần cập nhật
  if (!maNH) return Promise.reject(new Error("Mã Ngân hàng là bắt buộc"));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.put(`${API_URL}/${maNH}`, bankData, token);
};

/** Xóa một ngân hàng */
const deleteBank = (maNH: string): Promise<DeleteResponse> => {
  if (!maNH) return Promise.reject(new Error("Mã Ngân hàng là bắt buộc"));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.delete(`${API_URL}/${maNH}`, token);
};

// Export service object
const BankService = {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
};

export default BankService;
