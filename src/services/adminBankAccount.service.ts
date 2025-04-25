// src/services/adminBankAccount.service.ts
import apiHelper from "./apiHelper"; // Import helper và kiểu lỗi
import TokenService from "./token.service";
// Import kiểu dữ liệu (có thể tái sử dụng từ investor.service hoặc định nghĩa lại)
export interface BankAccountAdminItem {
  // Kiểu dữ liệu cho danh sách tất cả TKNH
  MaTK: string;
  MaNDT: string;
  TenNDT?: string; // Tên NĐT từ JOIN
  SoTien: number;
  MaNH: string;
  TenNH?: string; // Tên Ngân hàng từ JOIN
}

// Kiểu đầy đủ khi xem chi tiết (có thể giống ở trên)
export type BankAccountAdminDetail = BankAccountAdminItem;

// Kiểu dữ liệu để tạo mới TKNH từ Admin
export interface CreateBankAccountAdminPayload {
  MaTK: string;
  MaNDT: string; // Bắt buộc
  SoTien: number;
  MaNH: string;
}

// Kiểu dữ liệu để cập nhật TKNH từ Admin (chỉ SoTien, MaNH)
export interface UpdateBankAccountAdminPayload {
  SoTien?: number | null;
  MaNH?: string | null;
}

// Kiểu trả về chung khi xóa thành công
export interface DeleteResponse {
  message: string;
}

const API_URL = "/admin/bank-accounts"; // Endpoint mới

/** Lấy danh sách tất cả TKNH của tất cả NĐT */
const getAllBankAccounts = (): Promise<BankAccountAdminItem[]> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(API_URL, token);
};

/** Lấy chi tiết một TKNH theo MaTK */
const getBankAccountById = (maTK: string): Promise<BankAccountAdminDetail> => {
  const token = TokenService.getLocalAccessToken();
  if (!maTK) return Promise.reject(new Error("Mã Tài khoản là bắt buộc"));
  return apiHelper.get(`${API_URL}/${maTK}`, token);
};

/** Admin tạo mới TKNH cho một NĐT */
const createBankAccount = (
  payload: CreateBankAccountAdminPayload
): Promise<BankAccountAdminDetail> => {
  // Có thể thêm validation ở đây nếu cần, nhưng validator backend là chính
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(API_URL, payload, token);
};

/** Admin cập nhật TKNH theo MaTK (chỉ SoTien, MaNH) */
const updateBankAccount = (
  maTK: string,
  payload: UpdateBankAccountAdminPayload
): Promise<BankAccountAdminDetail> => {
  if (!maTK) return Promise.reject(new Error("Mã Tài khoản là bắt buộc"));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.put(`${API_URL}/${maTK}`, payload, token);
};

/** Admin xóa TKNH theo MaTK */
const deleteBankAccount = (maTK: string): Promise<DeleteResponse> => {
  if (!maTK) return Promise.reject(new Error("Mã Tài khoản là bắt buộc"));
  const token = TokenService.getLocalAccessToken();
  return apiHelper.delete(`${API_URL}/${maTK}`, token);
};

// Export service object
const AdminBankAccountService = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
};

export default AdminBankAccountService;
