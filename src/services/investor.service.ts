/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/investor.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

// Import các kiểu dữ liệu dùng chung nếu cần (ví dụ từ statement.service)
import type {
  OrderStatementResponse,
  MatchedOrderStatementResponse,
  CashStatementResponse,
} from "./statement.service"; // Hoặc định nghĩa lại nếu cần

const API_URL = "/nhadautu"; // Endpoint gốc cho NDT

// Định nghĩa kiểu dữ liệu NDT (chi tiết hơn, có thể bao gồm TKNH)
// Kiểu này có thể khác với StoredUser hoặc UserProfile
export interface NhaDauTuDetail {
  MaNDT: string;
  HoTen: string;
  NgaySinh?: string | Date | null;
  // MKGD không nên được trả về
  DiaChi: string;
  Phone: string;
  CMND: string;
  GioiTinh: "Nam" | "Nữ";
  Email?: string | null;
  // Danh sách tài khoản ngân hàng liên kết (nếu API trả về)
  TaiKhoanNganHang?: TaiKhoanNganHang[];
}

// Kiểu dữ liệu Tài khoản ngân hàng
export interface TaiKhoanNganHang {
  MaTK: string;
  MaNDT: string; // Có thể không cần nếu đã lồng trong NDT detail
  SoTien: number;
  MaNH: string;
  TenNH?: string; // Tên ngân hàng (từ JOIN)
}

// Kiểu dữ liệu để tạo NDT (không cần password vì dùng API riêng)
export type CreateNdtPayload = Omit<
  NhaDauTuDetail,
  "MaNDT" | "TaiKhoanNganHang" | "MKGD"
> & { MaNDT: string }; // Cần MaNDT khi tạo

// Kiểu dữ liệu để cập nhật NDT (Admin chỉ cập nhật một số trường)
export type UpdateNdtPayload = Partial<
  Omit<NhaDauTuDetail, "MaNDT" | "CMND" | "MKGD" | "TaiKhoanNganHang">
>;

// Kiểu dữ liệu để tạo/cập nhật TKNH
export type CreateUpdateTknhPayload = Omit<TaiKhoanNganHang, "MaNDT" | "TenNH">; // MaNDT lấy từ URL

// Kiểu dữ liệu cho portfolio (Danh mục CP)
export interface PortfolioItem {
  MaCP: string;
  TenCty?: string; // Có thể có tên cty
  SoLuong: number;
}
export type PortfolioResponse = PortfolioItem[];

// --- Quản lý NDT (cho Admin) ---

/** Lấy danh sách tất cả NDT (thông tin cơ bản) */
const getAllInvestors = (): Promise<NhaDauTuDetail[]> => {
  const token = TokenService.getLocalAccessToken();
  // API có thể chỉ trả về danh sách rút gọn, cần định nghĩa kiểu riêng nếu khác NhaDauTuDetail
  return apiHelper.get(API_URL, token); // Không cần body
};

/** Lấy thông tin chi tiết của một NDT (bao gồm cả TKNH) */
const getInvestorDetails = (maNDT: string): Promise<NhaDauTuDetail> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  return apiHelper.get(`${API_URL}/${maNDT}`, token); // Không cần body
};

/** Tạo mới một NDT (Lưu ý: Mật khẩu cần được tạo/cập nhật riêng qua admin.service) */
const createInvestor = (ndtData: CreateNdtPayload): Promise<NhaDauTuDetail> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(API_URL, ndtData, token); // Không cần body
};

/** Cập nhật thông tin NDT */
const updateInvestor = (
  maNDT: string,
  ndtData: UpdateNdtPayload
): Promise<NhaDauTuDetail> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  return apiHelper.put(`${API_URL}/${maNDT}`, ndtData, token); // Không cần body
};

/** Xóa một NDT (cần cẩn thận) */
const deleteInvestor = (maNDT: string): Promise<{ message: string }> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  return apiHelper.delete(`${API_URL}/${maNDT}`, token); // Không cần body
};

// --- Quản lý TK Ngân hàng của NDT (cho Admin) ---

/** Lấy danh sách TKNH của một NDT */
const getInvestorBankAccounts = (
  maNDT: string
): Promise<TaiKhoanNganHang[]> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  console.log("getInvestorBankAccounts", maNDT, token);
  return apiHelper.get(`${API_URL}/${maNDT}/taikhoan`, token); // Không cần body
};

/** Thêm TKNH mới cho NDT */
const addInvestorBankAccount = (
  maNDT: string,
  tknhData: CreateUpdateTknhPayload
): Promise<TaiKhoanNganHang> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  return apiHelper.post(`${API_URL}/${maNDT}/taikhoan`, tknhData, token);
};

/** Cập nhật thông tin TKNH (theo MaTK) */
// const updateInvestorBankAccount = (
//   maTK: string,
//   tknhData: Partial<CreateUpdateTknhPayload>
// ): Promise<TaiKhoanNganHang> => {
//   const token = TokenService.getLocalAccessToken();
//   if (!maTK) return Promise.reject(new Error("Mã TK là bắt buộc"));
//   // API endpoint dùng MaTK, không cần MaNDT
//   return apiHelper.put(`${API_URL}/taikhoan/${maTK}`, tknhData, token);
// };

// /** Xóa một TKNH (theo MaTK) */
// const deleteInvestorBankAccount = (
//   maTK: string
// ): Promise<{ message: string }> => {
//   const token = TokenService.getLocalAccessToken();
//   if (!maTK) return Promise.reject(new Error("Mã TK là bắt buộc"));
//   return apiHelper.delete(`${API_URL}/taikhoan/${maTK}`, token); // Không cần body
// };

// --- Tra cứu Thông tin NDT (cho Admin) ---

/** Lấy số dư các TKNH của NDT */
const getInvestorBalances = (maNDT: string): Promise<TaiKhoanNganHang[]> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  // API này có thể giống getInvestorBankAccounts hoặc khác tùy backend
  return apiHelper.get(`${API_URL}/${maNDT}/balance`, token); // Không cần body
};

/** Lấy danh mục cổ phiếu của NDT */
const getInvestorPortfolio = (maNDT: string): Promise<PortfolioResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
  return apiHelper.get(`${API_URL}/${maNDT}/portfolio`, token); // Không cần body
};

// --- Xem Sao kê NDT (cho Admin) ---

/** Lấy sao kê lệnh của NDT */
const getInvestorOrderStatement = (
  maNDT: string,
  tuNgay: string,
  denNgay: string
): Promise<OrderStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã NDT, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(`${API_URL}/${maNDT}/statement/orders`, token, params);
};

/** Lấy sao kê lệnh khớp của NDT */
const getInvestorMatchedOrderStatement = (
  maNDT: string,
  tuNgay: string,
  denNgay: string
): Promise<MatchedOrderStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã NDT, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(
    `${API_URL}/${maNDT}/statement/matched-orders`,
    token,
    params
  );
};

/** Lấy sao kê tiền mặt của NDT */
const getInvestorCashStatement = (
  maNDT: string,
  tuNgay: string,
  denNgay: string
): Promise<CashStatementResponse> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã NDT, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(`${API_URL}/${maNDT}/statement/cash`, token, params);
};

/** Gửi tiền vào tài khoản ngân hàng của NDT */
const depositToInvestorAccount = (
  maNDT: string,
  maTK: string,
  soTien: number,
  ghiChu?: string
): Promise<{ message: string }> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT || !maTK || soTien <= 0)
    return Promise.reject(
      new Error("Mã NDT, Mã TK và số tiền hợp lệ là bắt buộc")
    );
  const payload = { maTK, soTien, ghiChu, maNDT };
  return apiHelper.post(`${API_URL}/accounts/deposit`, payload, token);
};

/** Rút tiền từ tài khoản ngân hàng của NDT */
const withdrawFromInvestorAccount = (
  maNDT: string,
  maTK: string,
  soTien: number,
  ghiChu?: string
): Promise<{ message: string }> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT || !maTK || soTien <= 0)
    return Promise.reject(
      new Error("Mã NDT, Mã TK và số tiền hợp lệ là bắt buộc")
    );
  const payload = { maTK, soTien, ghiChu, maNDT };
  return apiHelper.post(`${API_URL}/accounts/withdraw`, payload, token);
};

/** Lấy sao kê chi tiết tài khoản tiền của NDT */
const getInvestorAccountCashStatementDetail = (
  maNDT: string,
  maTK: string,
  tuNgay: string,
  denNgay: string
): Promise<any> => {
  const token = TokenService.getLocalAccessToken();
  if (!maNDT || !maTK || !tuNgay || !denNgay)
    return Promise.reject(
      new Error("Mã NDT, Mã TK, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  return apiHelper.get(
    `${API_URL}/${maNDT}/accounts/${maTK}/cash-statement-detail`,
    token,
    params
  );
};

// Export service object
const InvestorService = {
  getAllInvestors,
  getInvestorDetails,
  createInvestor,
  updateInvestor,
  deleteInvestor,
  getInvestorBankAccounts,
  addInvestorBankAccount,
  // updateInvestorBankAccount,
  // deleteInvestorBankAccount,
  getInvestorBalances,
  getInvestorPortfolio,
  getInvestorOrderStatement,
  getInvestorMatchedOrderStatement,
  getInvestorCashStatement,
  depositToInvestorAccount,
  withdrawFromInvestorAccount,
  getInvestorAccountCashStatementDetail,
};

export default InvestorService;
