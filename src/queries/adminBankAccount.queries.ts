// src/queries/adminBankAccount.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminBankAccountService from "../services/adminBankAccount.service";

// Import kiểu dữ liệu
import type {
  BankAccountAdminItem,
  BankAccountAdminDetail,
  CreateBankAccountAdminPayload,
  UpdateBankAccountAdminPayload,
  DeleteResponse,
} from "../services/adminBankAccount.service";
import { APIError } from "../services/apiHelper";
// Import key của investor để invalidate khi cần
import { investorKeys } from "./investor.queries";

// --- Query Keys ---
const adminBankAccountKeys = {
  all: ["adminBankAccounts"] as const,
  lists: () => [...adminBankAccountKeys.all, "list"] as const, // Key cho danh sách tổng
  details: () => [...adminBankAccountKeys.all, "detail"] as const,
  detail: (maTK: string | undefined) =>
    [...adminBankAccountKeys.details(), maTK] as const, // Key cho chi tiết
};

// --- Queries ---

/** Hook để lấy danh sách TẤT CẢ tài khoản ngân hàng */
export const useGetAllBankAccountsQuery = () => {
  return useQuery<BankAccountAdminItem[], APIError>({
    queryKey: adminBankAccountKeys.lists(),
    queryFn: AdminBankAccountService.getAllBankAccounts,
    staleTime: 1000 * 60 * 2, // Dữ liệu này có thể thay đổi thường xuyên hơn list NDT (2 phút)
  });
};

/** Hook để lấy chi tiết một TKNH theo MaTK */
export const useGetBankAccountByIdQuery = (maTK: string | undefined) => {
  return useQuery<BankAccountAdminDetail, APIError>({
    queryKey: adminBankAccountKeys.detail(maTK),
    queryFn: () => {
      if (!maTK)
        return Promise.reject(new APIError("Mã Tài khoản là bắt buộc", 400));
      return AdminBankAccountService.getBankAccountById(maTK);
    },
    enabled: !!maTK,
    staleTime: 1000 * 60 * 5, // Chi tiết TKNH (5 phút)
  });
};

// --- Mutations ---

/** Hook để Admin tạo mới TKNH */
export const useCreateBankAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    BankAccountAdminDetail,
    APIError,
    CreateBankAccountAdminPayload
  >({
    mutationFn: AdminBankAccountService.createBankAccount,
    onSuccess: (newAccount) => {
      console.log("Admin created bank account:", newAccount);
      // Làm mới danh sách tổng quát
      queryClient.invalidateQueries({ queryKey: adminBankAccountKeys.lists() });
      // Làm mới danh sách TKNH của NĐT cụ thể (nếu đang xem)
      queryClient.invalidateQueries({
        queryKey: investorKeys.bankAccounts(newAccount.MaNDT),
      });
      queryClient.invalidateQueries({
        queryKey: investorKeys.detail(newAccount.MaNDT),
      }); // Cả chi tiết NDT
      queryClient.invalidateQueries({
        queryKey: investorKeys.balances(newAccount.MaNDT),
      }); // Cả số dư
      // -> Thông báo thành công
    },
    onError: (error) => {
      console.error("Admin create bank account failed:", error);
      // -> Hiển thị lỗi (vd: MaTK/MaNDT/MaNH không hợp lệ, trùng lặp)
    },
  });
};

/** Hook để Admin cập nhật TKNH */
export const useUpdateBankAccountMutation = () => {
  const queryClient = useQueryClient();
  // Cần MaNDT để invalidate cache của NĐT đó sau khi thành công
  return useMutation<
    BankAccountAdminDetail,
    APIError,
    { maTK: string; payload: UpdateBankAccountAdminPayload; maNDT?: string }
  >({
    mutationFn: ({ maTK, payload }) =>
      AdminBankAccountService.updateBankAccount(maTK, payload),
    onSuccess: (updatedAccount, variables) => {
      console.log("Admin updated bank account:", updatedAccount);
      const maNDT = variables.maNDT || updatedAccount.MaNDT; // Lấy MaNDT
      // Làm mới danh sách tổng quát
      queryClient.invalidateQueries({ queryKey: adminBankAccountKeys.lists() });
      // Làm mới cache chi tiết của TKNH này
      queryClient.invalidateQueries({
        queryKey: adminBankAccountKeys.detail(variables.maTK),
      });
      // Hoặc cập nhật cache chi tiết trực tiếp
      // queryClient.setQueryData(adminBankAccountKeys.detail(variables.maTK), updatedAccount);

      // Làm mới các cache liên quan đến NĐT đó
      if (maNDT) {
        queryClient.invalidateQueries({
          queryKey: investorKeys.bankAccounts(maNDT),
        });
        queryClient.invalidateQueries({ queryKey: investorKeys.detail(maNDT) });
        queryClient.invalidateQueries({
          queryKey: investorKeys.balances(maNDT),
        });
      }
      // -> Thông báo thành công
    },
    onError: (error) => {
      console.error("Admin update bank account failed:", error);
      // -> Hiển thị lỗi
    },
  });
};

/** Hook để Admin xóa TKNH */
export const useDeleteBankAccountMutation = () => {
  const queryClient = useQueryClient();
  // Cần MaNDT để invalidate cache của NĐT đó sau khi thành công
  return useMutation<
    DeleteResponse,
    APIError,
    { maTK: string; maNDT?: string }
  >({
    mutationFn: ({ maTK }) => AdminBankAccountService.deleteBankAccount(maTK),
    onSuccess: (data, variables) => {
      console.log("Admin deleted bank account:", variables.maTK, data.message);
      const maNDT = variables.maNDT;
      // Làm mới danh sách tổng quát
      queryClient.invalidateQueries({ queryKey: adminBankAccountKeys.lists() });
      // Xóa cache chi tiết của TKNH này
      queryClient.removeQueries({
        queryKey: adminBankAccountKeys.detail(variables.maTK),
      });

      // Làm mới các cache liên quan đến NĐT đó
      if (maNDT) {
        queryClient.invalidateQueries({
          queryKey: investorKeys.bankAccounts(maNDT),
        });
        queryClient.invalidateQueries({ queryKey: investorKeys.detail(maNDT) });
        queryClient.invalidateQueries({
          queryKey: investorKeys.balances(maNDT),
        });
      }
      // -> Thông báo thành công
    },
    onError: (error) => {
      console.error("Admin delete bank account failed:", error);
      // -> Hiển thị lỗi (đặc biệt lỗi Conflict 409 nếu còn lệnh/tiền)
    },
  });
};
