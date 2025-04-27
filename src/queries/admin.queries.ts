/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/admin.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminService from "../services/admin.service";

// Import kiểu dữ liệu nếu cần (từ service hoặc định nghĩa riêng)
import type {
  BackupHistoryResponse,
  SimpleMessageResponse,
} from "../services/admin.service";
import { APIError } from "@/services/apiHelper";
import TokenService from "@/services/token.service";

// --- Query Keys ---
const adminKeys = {
  all: ["admin"] as const,
  backupHistory: () => [...adminKeys.all, "backupHistory"] as const,
  allOrders: () => [...adminKeys.all, "orders", "all"] as const,
  // Thêm các key khác nếu cần quản lý state khác liên quan đến admin
};

// --- Queries ---

/**
 * Hook để lấy lịch sử sao lưu Full Backup.
 */
export const useBackupHistoryQuery = () => {
  return useQuery<BackupHistoryResponse, Error>({
    queryKey: adminKeys.backupHistory(),
    queryFn: AdminService.getBackupHistory,
    staleTime: 1000 * 60, // Lịch sử backup có thể thay đổi, staleTime ngắn hơn (1 phút)
    // enabled: // Thường luôn bật nếu component admin hiển thị
  });
};

// --- Mutations ---

/**
 * Hook để tạo/kiểm tra Backup Device.
 */
export const useCreateDeviceMutation = () => {
  // Không cần invalidate gì đặc biệt sau khi tạo device, có thể refetch history nếu muốn
  return useMutation<SimpleMessageResponse, Error, void>({
    // Input là void vì không cần tham số
    mutationFn: () => AdminService.createBackupDevice(),
    onSuccess: (data) => {
      console.log("Create/Check device successful:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Create/Check device failed:", error);
      // Hiển thị lỗi (error.message) cho admin
    },
  });
};

/**
 * Hook để thực hiện Full Backup.
 */
export const usePerformBackupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SimpleMessageResponse, Error, { deleteAllOld: boolean }>({
    mutationFn: ({ deleteAllOld }) => AdminService.performBackup(deleteAllOld),
    onSuccess: (data) => {
      console.log("Backup successful:", data.message, "File:", data.fileName);
      // Quan trọng: Vô hiệu hóa query lịch sử để cập nhật danh sách mới nhất
      queryClient.invalidateQueries({ queryKey: adminKeys.backupHistory() });
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Backup failed:", error);
      // Hiển thị lỗi cho admin
    },
  });
};

/**
 * Hook để thực hiện Restore (Full hoặc PITR).
 */
export const usePerformRestoreMutation = () => {
  const queryClient = useQueryClient();
  // Không cần invalidate gì sau restore, nhưng có thể muốn thông báo hoặc thực hiện hành động khác
  return useMutation<
    SimpleMessageResponse,
    Error,
    { backupFileName: string; pointInTime?: string | null }
  >({
    mutationFn: ({ backupFileName, pointInTime }) =>
      AdminService.performRestore(backupFileName, pointInTime),
    onSuccess: (data) => {
      console.log("Restore successful:", data.message);
      // Hiển thị thông báo thành công lớn, cảnh báo người dùng cần kiểm tra lại hệ thống
      // Có thể cần reload trang hoặc làm gì đó để user thấy dữ liệu mới
      // queryClient.clear(); // Xóa cache để buộc load lại mọi thứ? Cân nhắc
    },
    onError: (error: any) => {
      console.error("Restore failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để lấy danh sách lịch sử backup (MỚI).
 */
export const useGetBackupHistoryListQuery = () => {
  return useQuery<BackupHistoryResponse, Error>({
    queryKey: adminKeys.backupHistory(),
    queryFn: AdminService.getBackupHistoryList,
    staleTime: 1000 * 60, // Lịch sử backup có thể thay đổi, staleTime ngắn hơn (1 phút)
  });
};

/**
 * Hook để cập nhật mật khẩu user (do Admin thực hiện).
 */
// export const useAdminUpdatePasswordMutation = () => {
//   return useMutation<
//     SimpleMessageResponse,
//     Error,
//     {
//       targetUserId: string;
//       password?: string;
//       role?: "Nhanvien" | "Nhà đầu tư";
//     }
//   >({
//     mutationFn: ({ targetUserId, password, role }) =>
//       AdminService.updateUserPassword(targetUserId, password, role),
//     onSuccess: (data) => {
//       console.log("Admin updated user password:", data.message);
//       // Hiển thị thông báo thành công
//     },
//     onError: (error: any) => {
//       console.error("Admin update password failed:", error);
//       // Hiển thị lỗi
//     },
//   });
// };

/**
 * Hook để xóa mật khẩu user (do Admin thực hiện).
 */
export const useAdminClearPasswordMutation = () => {
  return useMutation<SimpleMessageResponse, Error, { loginname: string }>({
    mutationFn: ({ loginname }) => AdminService.clearUserPassword(loginname),
    onSuccess: (data) => {
      console.log("Admin cleared user password:", data.message);
      // Hiển thị thông báo thành công
    },
    onError: (error: any) => {
      console.error("Admin clear password failed:", error);
      // Hiển thị lỗi
    },
  });
};

/**
 * Hook để tạo tài khoản mới.
 */
export const useCreateAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SimpleMessageResponse, Error, Record<string, any>>({
    mutationFn: (accountData) => AdminService.createAccount(accountData),
    onSuccess: (data) => {
      console.log("Account created successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] });
    },
    onError: (error: any) => {
      console.error("Account creation failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để lấy danh sách tất cả người dùng.
 */
export const useGetAllUsersQuery = () => {
  return useQuery<any[], Error>({
    queryKey: [...adminKeys.all, "users"],
    queryFn: () => AdminService.getAllUsers(),
    staleTime: 1000 * 60 * 5, // Dữ liệu người dùng ít thay đổi, có thể để staleTime dài hơn (5 phút)
    // Xử lý lỗi thông qua error từ kết quả query
  });
};

/**
 * Hook để xóa tài khoản người dùng.
 */
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SimpleMessageResponse,
    Error,
    { accountId: string; role: "NhanVien" | "NhaDauTu" }
  >({
    mutationFn: ({ accountId, role }) =>
      AdminService.deleteAccount(accountId, role),
    onSuccess: (data) => {
      console.log("Account deleted successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] });
    },
    onError: (error: any) => {
      console.error("Account deletion failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để cập nhật thông tin tài khoản người dùng.
 */
export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SimpleMessageResponse,
    Error,
    { accountId: string; accountData: Record<string, any> }
  >({
    mutationFn: ({ accountId, accountData }) =>
      AdminService.updateAccount(accountId, accountData),
    onSuccess: (data) => {
      console.log("Account updated successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] });
    },
    onError: (error: any) => {
      console.error("Account update failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để lấy danh sách giao dịch tiền mặt trong khoảng thời gian.
 */
export const useGetAllCashTransactionsQuery = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery<any[], Error>({
    queryKey: [...adminKeys.all, "cashTransactions", { startDate, endDate }],
    queryFn: () => AdminService.getAllCashTransactions(startDate, endDate),
    staleTime: 1000 * 60 * 5, // Dữ liệu giao dịch ít thay đổi, có thể để staleTime dài hơn (5 phút)
    enabled: !!startDate && !!endDate, // Chỉ chạy query nếu có cả startDate và endDate
  });
};

/**
 * Hook để chuẩn bị giá cho ngày tiếp theo.
 */
export const usePrepareNextDayPricesMutation = () => {
  return useMutation<SimpleMessageResponse, Error, void>({
    mutationFn: () => AdminService.prepareNextDayPrices(),
    onSuccess: (data) => {
      console.log("Prepared next day prices successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Preparing next day prices failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để kích hoạt khớp lệnh ATO.
 */
export const useTriggerATOMutation = () => {
  return useMutation<SimpleMessageResponse, Error, void>({
    mutationFn: () => AdminService.triggerATO(),
    onSuccess: (data) => {
      console.log("ATO triggered successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("ATO trigger failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để kích hoạt khớp lệnh ATC.
 */
export const useTriggerATCMutation = () => {
  return useMutation<SimpleMessageResponse, Error, void>({
    mutationFn: () => AdminService.triggerATC(),
    onSuccess: (data) => {
      console.log("ATC triggered successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("ATC trigger failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để kích hoạt khớp lệnh LO (Continuous Matching).
 */
export const useTriggerContinuousMutation = () => {
  return useMutation<SimpleMessageResponse, Error, void>({
    mutationFn: () => AdminService.triggerContinuous(),
    onSuccess: (data) => {
      console.log("Continuous matching triggered successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Continuous matching trigger failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để đặt chế độ Tự động cho thị trường.
 */
export const useSetMarketModeAutoMutation = () => {
  return useMutation<SimpleMessageResponse, Error, void>({
    mutationFn: () => AdminService.setMarketModeAuto(),
    onSuccess: (data) => {
      console.log("Market mode set to Auto successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Setting market mode to Auto failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để đặt chế độ Thủ công cho thị trường.
 */
export const useSetMarketModeManualMutation = () => {
  return useMutation<SimpleMessageResponse, Error, void>({
    mutationFn: () => AdminService.setMarketModeManual(),
    onSuccess: (data) => {
      console.log("Market mode set to Manual successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Setting market mode to Manual failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để lấy trạng thái và chế độ hiện tại của thị trường.
 */
export const useGetMarketStatusQuery = () => {
  return useQuery<{ operatingMode: string; sessionState: string }, Error>({
    queryKey: [...adminKeys.all, "marketStatus"],
    queryFn: () => AdminService.getMarketStatus(),
    staleTime: 1000 * 60, // Dữ liệu trạng thái thị trường có thể thay đổi, staleTime ngắn hơn (1 phút)
  });
};

/**
 * Hook để Admin lấy toàn bộ lịch sử lệnh đặt của tất cả NĐT.
 * @param tuNgay Ngày bắt đầu (YYYY-MM-DD).
 * @param denNgay Ngày kết thúc (YYYY-MM-DD).
 */
export const useGetAllAdminOrdersQuery = (
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isValid = !!tuNgay && !!denNgay;
  const range = { tuNgay, denNgay };

  return useQuery<any, APIError>({
    queryKey: [...adminKeys.allOrders(), range], // Key bao gồm khoảng ngày
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new APIError("Ngày bắt đầu và Ngày kết thúc là bắt buộc", 400)
        );
      // Ép kiểu vì đã kiểm tra isValid
      return AdminService.getAllOrders(tuNgay as string, denNgay as string);
    },
    enabled: isValid, // Chỉ chạy khi có ngày hợp lệ
    staleTime: 1000 * 60, // Dữ liệu có thể thay đổi (1 phút)
  });
};

/**
 * Hook để đặt lại mật khẩu của tài khoản người dùng.
 */
export const useResetUserPasswordMutation = () => {
  return useMutation<
    SimpleMessageResponse,
    Error,
    {
      accountId: string;
      role: "NhanVien" | "NhaDauTu";
      newPassword: string;
      confirmPassword: string;
    }
  >({
    mutationFn: ({ accountId, role, newPassword, confirmPassword }) =>
      AdminService.resetUserPassword(
        accountId,
        role,
        newPassword,
        confirmPassword
      ),
    onSuccess: (data) => {
      console.log("Password reset successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Password reset failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để phân bổ cổ phiếu ban đầu.
 */
export const useDistributeStockMutation = () => {
  return useMutation<
    SimpleMessageResponse,
    Error,
    { maCP: string; distributionList: { maNDT: string; [key: string]: any }[] }
  >({
    mutationFn: ({ maCP, distributionList }) =>
      AdminService.distributeStock(maCP, distributionList),
    onSuccess: (data) => {
      console.log("Stock distributed successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Stock distribution failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để cập nhật phân bổ cổ phiếu của một nhà đầu tư.
 */
export const useUpdateInvestorDistributionMutation = () => {
  return useMutation<
    SimpleMessageResponse,
    Error,
    { maCP: string; maNDT: string; newSoLuong: number }
  >({
    mutationFn: ({ maCP, maNDT, newSoLuong }) =>
      AdminService.updateInvestorDistribution(maCP, maNDT, newSoLuong),
    onSuccess: (data) => {
      console.log("Investor distribution updated successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Updating investor distribution failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để xóa phân bổ cổ phiếu của một nhà đầu tư.
 */
export const useRevokeInvestorDistributionMutation = () => {
  return useMutation<
    SimpleMessageResponse,
    Error,
    { maCP: string; maNDT: string }
  >({
    mutationFn: ({ maCP, maNDT }) =>
      AdminService.revokeInvestorDistribution(maCP, maNDT),
    onSuccess: (data) => {
      console.log("Investor distribution revoked successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Revoking investor distribution failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};

/**
 * Hook để cho phép giao dịch trở lại một cổ phiếu.
 */
export const useRelistStockMutation = () => {
  return useMutation<
    SimpleMessageResponse,
    Error,
    { maCP: string; giaTC: number }
  >({
    mutationFn: ({ maCP, giaTC }) => AdminService.relistStock(maCP, giaTC),
    onSuccess: (data) => {
      console.log("Stock relisted successfully:", data.message);
      // Hiển thị thông báo thành công cho admin
    },
    onError: (error: any) => {
      console.error("Relisting stock failed:", error);
      // Hiển thị lỗi chi tiết cho admin
    },
  });
};
