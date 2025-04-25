// src/queries/bank.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BankService from "../services/bank.service";

// Import kiểu dữ liệu
import type {
  Bank,
  CreateBankPayload,
  UpdateBankPayload,
  DeleteResponse,
} from "../services/bank.service";
import { APIError } from "../services/apiHelper"; // Import kiểu lỗi

// --- Query Keys ---
const bankKeys = {
  all: ["banks"] as const,
  lists: () => [...bankKeys.all, "list"] as const, // Key cho danh sách
  details: () => [...bankKeys.all, "detail"] as const,
  detail: (maNH: string | undefined) => [...bankKeys.details(), maNH] as const, // Key cho chi tiết
};

// --- Queries ---

/** Hook để lấy danh sách tất cả ngân hàng */
export const useGetAllBanksQuery = () => {
  return useQuery<Bank[], APIError>({
    // Sử dụng ApiError cho kiểu lỗi
    queryKey: bankKeys.lists(),
    queryFn: BankService.getAllBanks,
    staleTime: 1000 * 60 * 15, // Danh sách ngân hàng khá ổn định (15 phút)
  });
};

/** Hook để lấy chi tiết một ngân hàng */
export const useGetBankByIdQuery = (maNH: string | undefined) => {
  return useQuery<Bank, APIError>({
    queryKey: bankKeys.detail(maNH),
    queryFn: () => {
      if (!maNH)
        return Promise.reject(new APIError("Mã Ngân hàng là bắt buộc", 400));
      return BankService.getBankById(maNH);
    },
    enabled: !!maNH, // Chỉ chạy khi có maNH
    staleTime: 1000 * 60 * 30, // Chi tiết còn ổn định hơn
  });
};

// --- Mutations ---

/** Hook để tạo mới ngân hàng */
export const useCreateBankMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Bank, APIError, CreateBankPayload>({
    mutationFn: BankService.createBank,
    onSuccess: (newBank) => {
      console.log("Bank created:", newBank);
      // Làm mới danh sách ngân hàng sau khi tạo thành công
      queryClient.invalidateQueries({ queryKey: bankKeys.lists() });
      // (Optional) Có thể thêm vào cache danh sách ngay lập tức nếu muốn tối ưu UI
      queryClient.setQueryData<Bank[]>(bankKeys.lists(), (oldData) =>
        oldData
          ? [...oldData, newBank].sort((a, b) => a.TenNH.localeCompare(b.TenNH))
          : [newBank]
      );
      // (Optional) Thêm vào cache chi tiết
      queryClient.setQueryData(bankKeys.detail(newBank.MaNH), newBank);
      // -> Thông báo thành công cho người dùng
    },
    onError: (error) => {
      console.error("Create bank failed:", error);
      // -> Hiển thị lỗi cho người dùng (error.message)
    },
  });
};

/** Hook để cập nhật ngân hàng */
export const useUpdateBankMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Bank,
    APIError,
    { maNH: string; bankData: Partial<UpdateBankPayload> }
  >({
    mutationFn: ({ maNH, bankData }) => BankService.updateBank(maNH, bankData),
    onSuccess: (updatedBank, variables) => {
      console.log("Bank updated:", updatedBank);
      // Làm mới danh sách và chi tiết của ngân hàng vừa sửa
      queryClient.invalidateQueries({ queryKey: bankKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bankKeys.detail(variables.maNH),
      });
      // (Optional) Cập nhật cache chi tiết trực tiếp
      queryClient.setQueryData(bankKeys.detail(variables.maNH), updatedBank);
      // -> Thông báo thành công
    },
    onError: (error) => {
      console.error("Update bank failed:", error);
      // -> Hiển thị lỗi
    },
  });
};

/** Hook để xóa ngân hàng */
export const useDeleteBankMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<DeleteResponse, APIError, { maNH: string }>({
    mutationFn: ({ maNH }) => BankService.deleteBank(maNH),
    onSuccess: (data, variables) => {
      console.log("Bank deleted:", variables.maNH, data.message);
      // Làm mới danh sách và xóa cache chi tiết của ngân hàng vừa xóa
      queryClient.invalidateQueries({ queryKey: bankKeys.lists() });
      queryClient.removeQueries({ queryKey: bankKeys.detail(variables.maNH) });
      // -> Thông báo thành công
    },
    onError: (error) => {
      console.error("Delete bank failed:", error);
      // -> Hiển thị lỗi (đặc biệt lỗi Conflict 409 nếu còn TK liên kết)
    },
  });
};
