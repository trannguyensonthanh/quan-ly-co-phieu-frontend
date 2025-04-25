/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/admin.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

const API_URL = "/admin";

// Định nghĩa kiểu dữ liệu trả về từ API (thường là message hoặc data cụ thể)
export interface SimpleMessageResponse {
  message: string;
  [key: string]: any; // Cho phép các thuộc tính khác nếu có
}

interface BackupHistoryItem {
  id: string; // ID của bản backup
  fileName: string;
  filePath: string; // Đường dẫn đến file backup trên server
  fileSize: number; // Kích thước file backup (bytes)
  fileSizeMB: number; // Kích thước file backup (MB)
  createdAt: string | Date; // API trả về string ISO, có thể convert sang Date
  cleanupPerformed: boolean; // True nếu đã thực hiện xóa bản backup cũ
}

export type BackupHistoryResponse = BackupHistoryItem[]; // API trả về mảng

// --- Device Management ---
/**
 * Gọi API để tạo hoặc kiểm tra backup device trên server.
 */
const createBackupDevice = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/device`, {}, token); // Body rỗng
};

// --- Backup Operations ---
/**
 * Gọi API để thực hiện Full Backup.
 * @param deleteAllOld True nếu muốn xóa các bản backup cũ sau khi backup mới thành công.
 */
const performBackup = (
  deleteAllOld: boolean = false
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/backup`, {
    deleteAllOld,
    token,
  });
};

// --- Restore Operations ---
/**
 * Gọi API để thực hiện Restore (Full hoặc PITR).
 * @param backupFileName Tên file .bak được chọn để restore.
 * @param pointInTime Thời điểm PITR (ISO string) hoặc null/undefined để restore full.
 */
const performRestore = (
  backupFileName: string,
  pointInTime?: string | null
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  const payload: { backupFileName: string; pointInTime?: string } = {
    backupFileName,
  };
  if (pointInTime) {
    payload.pointInTime = pointInTime;
  }
  return apiHelper.post(`${API_URL}/restore`, payload, token);
};

// --- Backup History ---
/**
 * Gọi API để lấy lịch sử các bản Full Backup.
 */
const getBackupHistory = (): Promise<BackupHistoryResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/backup-history`, token); // Không cần body
};

/**
 * Gọi API để lấy danh sách lịch sử backup (MỚI).
 */
const getBackupHistoryList = (): Promise<BackupHistoryResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/backup-history`, token);
};

// // --- User Account Management (Theo logic mới: chỉ quản lý password) ---
// /**
//  * Gọi API để tạo/cập nhật mật khẩu cho tài khoản người dùng ứng dụng.
//  * @param targetUserId MaNV hoặc MaNDT.
//  * @param password Mật khẩu mới.
//  * @param role 'Nhanvien' hoặc 'Nhà đầu tư'.
//  */
// const updateUserPassword = (
//   targetUserId: string,
//   password?: string,
//   role?: "Nhanvien" | "Nhà đầu tư"
// ): Promise<SimpleMessageResponse> => {
//   const token = TokenService.getLocalAccessToken();
//   if (!password || !role) {
//     return Promise.reject(
//       new Error("Password and Role are required to update user password.")
//     );
//   }
//   // Gọi endpoint /logins cũ
//   return apiHelper.post(
//     `/admin/logins`,
//     {
//       targetUserId,
//       password,
//       role,
//     },
//     token
//   );
// };

/**
 * Gọi API để xóa mật khẩu của tài khoản người dùng ứng dụng.
 * @param loginname MaNV hoặc MaNDT.
 */
const clearUserPassword = (
  loginname: string
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();

  return apiHelper.delete(`/admin/logins/${loginname}`, token);
};

/**
 * Gọi API để tạo tài khoản người dùng mới.
 * @param accountData Dữ liệu tài khoản mới (bao gồm các thông tin cần thiết như username, password, role, v.v.).
 */
const createAccount = (
  accountData: Record<string, any>
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/accounts`, accountData, token);
};

/**
 * Gọi API để lấy danh sách người dùng (Nhân viên và Nhà đầu tư).
 */
const getAllUsers = (): Promise<any[]> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/users`, token);
};

/**
 * Gọi API để xóa tài khoản người dùng.
 * @param accountId ID của tài khoản cần xóa.
 * @param role Vai trò của tài khoản ('Nhanvien' hoặc 'Nhà đầu tư').
 */
const deleteAccount = (
  accountId: string,
  role: "NhanVien" | "NhaDauTu"
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  console.log("Deleting account:", accountId, "with role:", role);
  const userId = accountId.trim(); // Xóa khoảng trắng nếu có
  return apiHelper.delete(`${API_URL}/accounts/${userId}?role=${role}`, token);
};

/**
 * Gọi API để cập nhật thông tin tài khoản người dùng.
 * @param accountId ID của tài khoản cần cập nhật.
 * @param accountData Dữ liệu cập nhật cho tài khoản.
 */
const updateAccount = (
  accountId: string,
  accountData: Record<string, any>
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.put(`${API_URL}/accounts/${accountId}`, accountData, token);
};

/**
 * Gọi API để lấy toàn bộ lịch sử Nạp/Rút tiền.
 * @param startDate Ngày bắt đầu (ISO string) để lọc lịch sử.
 * @param endDate Ngày kết thúc (ISO string) để lọc lịch sử.
 */
const getAllCashTransactions = (
  startDate?: string,
  endDate?: string
): Promise<any[]> => {
  const token = TokenService.getLocalAccessToken();
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("tuNgay", startDate);
  if (endDate) queryParams.append("denNgay", endDate);
  const queryString = queryParams.toString();
  console.log("Query string for cash transactions:", queryString);
  return apiHelper.get(
    `${API_URL}/cash-transactions${queryString ? `?${queryString}` : ""}`,
    token
  );
};

/**
 * Gọi API để lấy toàn bộ lịch sử hoàn tác.
 */
const getAllUndoLogs = (): Promise<any[]> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/undo-logs`, token);
};

/**
 * Gọi API để hoàn tác hành động cổ phiếu cuối cùng (Status=0).
 */
const undoLastCoPhieuAction = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/undo-last-cophieu-action`, {}, token);
};

/**
 * Gọi API để chuẩn bị giá cho ngày tiếp theo.
 */
const prepareNextDayPrices = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/market/prepare-prices`, {}, token);
};

/**
 * Gọi API để kích hoạt khớp lệnh ATO.
 */
const triggerATO = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/market/trigger-ato`, {}, token);
};

/**
 * Gọi API để kích hoạt khớp lệnh ATC.
 */
const triggerATC = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/market/trigger-atc`, {}, token);
};

/**
 * Gọi API để kích hoạt một chu kỳ khớp lệnh LO (Continuous Matching).
 */
const triggerContinuous = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/market/trigger-continuous`, {}, token);
};

/**
 * Gọi API để đặt chế độ Tự động cho thị trường.
 */
const setMarketModeAuto = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/market/mode/auto`, {}, token);
};

/**
 * Gọi API để đặt chế độ Thủ công cho thị trường.
 */
const setMarketModeManual = (): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.post(`${API_URL}/market/mode/manual`, {}, token);
};

/**
 * Gọi API để lấy trạng thái và chế độ hiện tại của thị trường.
 */
const getMarketStatus = (): Promise<{
  operatingMode: string;
  sessionState: string;
}> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/market/status`, token);
};

/**
 * Admin lấy toàn bộ lịch sử lệnh đặt của tất cả NĐT.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
const getAllOrders = (tuNgay: string, denNgay: string): Promise<any> => {
  if (!tuNgay || !denNgay)
    return Promise.reject(
      new Error("Ngày bắt đầu và Ngày kết thúc là bắt buộc")
    );
  const params = { tuNgay, denNgay };
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/orders/all`, token, params);
};

/**
 * Gọi API để đặt lại mật khẩu của tài khoản người dùng.
 * @param accountId ID của tài khoản cần đặt lại mật khẩu.
 * @param role Vai trò của tài khoản ('NhanVien' hoặc 'NhaDauTu').
 * @param newPassword Mật khẩu mới.
 * @param confirmPassword Xác nhận mật khẩu mới.
 */
const resetUserPassword = (
  accountId: string,
  role: "NhanVien" | "NhaDauTu",
  newPassword: string,
  confirmPassword: string
): Promise<SimpleMessageResponse> => {
  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    return Promise.reject(
      new Error("Passwords must be provided and must match.")
    );
  }
  const token = TokenService.getLocalAccessToken();
  return apiHelper.put(
    `${API_URL}/accounts/${accountId}/reset-password`,
    { role, newPassword, confirmPassword },
    token
  );
};

// Export service object
const AdminService = {
  createBackupDevice,
  performBackup,
  performRestore,
  getBackupHistory,
  // updateUserPassword,
  clearUserPassword,
  createAccount,
  getAllUsers,
  deleteAccount,
  updateAccount,
  getAllCashTransactions,
  getAllUndoLogs,
  undoLastCoPhieuAction,
  prepareNextDayPrices,
  triggerATO,
  triggerATC,
  triggerContinuous,
  setMarketModeAuto,
  setMarketModeManual,
  getMarketStatus,
  getAllOrders,
  resetUserPassword,
  getBackupHistoryList,
};

export default AdminService;
