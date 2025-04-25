/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/investor.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InvestorService from "../services/investor.service";

// Import kiểu dữ liệu (có thể dùng lại từ service)
import type {
  NhaDauTuDetail,
  CreateNdtPayload,
  UpdateNdtPayload,
  TaiKhoanNganHang,
  CreateUpdateTknhPayload,
  PortfolioResponse,
} from "../services/investor.service"; // Hoặc import từ các service gốc nếu cần

import type {
  OrderStatementResponse, // Tái sử dụng từ statement.service
  MatchedOrderStatementResponse, // Tái sử dụng từ statement.service
  CashStatementResponse, // Tái sử dụng từ statement.service
} from "../services/statement.service"; // Hoặc định nghĩa lại nếu cần

import type { SimpleMessageResponse } from "../services/admin.service";

// --- Query Keys ---
export const investorKeys = {
  all: ["investors"] as const,
  lists: () => [...investorKeys.all, "list"] as const, // Danh sách NDT
  details: () => [...investorKeys.all, "detail"] as const,
  detail: (maNDT: string | undefined) =>
    [...investorKeys.details(), maNDT] as const, // Chi tiết 1 NDT
  bankAccounts: (maNDT: string | undefined) =>
    [...investorKeys.detail(maNDT), "bankAccounts"] as const, // TKNH của NDT
  balances: (maNDT: string | undefined) =>
    [...investorKeys.detail(maNDT), "balances"] as const, // Số dư NDT
  portfolio: (maNDT: string | undefined) =>
    [...investorKeys.detail(maNDT), "portfolio"] as const, // Danh mục NDT
  statements: (maNDT: string | undefined) =>
    [...investorKeys.detail(maNDT), "statements"] as const, // Base key cho sao kê
  orderStatement: (
    maNDT: string | undefined,
    range: { tuNgay?: string; denNgay?: string }
  ) => [...investorKeys.statements(maNDT), "orders", range] as const,
  matchedStatement: (
    maNDT: string | undefined,
    range: { tuNgay?: string; denNgay?: string }
  ) => [...investorKeys.statements(maNDT), "matched", range] as const,
  cashStatement: (
    maNDT: string | undefined,
    range: { tuNgay?: string; denNgay?: string }
  ) => [...investorKeys.statements(maNDT), "cash", range] as const,
};

// --- Queries (Dành cho Admin xem thông tin NDT) ---

/** Hook lấy danh sách tất cả Nhà Đầu Tư */
export const useGetAllInvestorsQuery = () => {
  return useQuery<NhaDauTuDetail[], Error>({
    queryKey: investorKeys.lists(),
    queryFn: InvestorService.getAllInvestors,
    staleTime: 1000 * 60 * 5, // Danh sách NDT ít thay đổi (5 phút)
  });
};

/** Hook lấy thông tin chi tiết của một NĐT (bao gồm TKNH nếu API trả về) */
export const useGetInvestorDetailsQuery = (maNDT: string | undefined) => {
  return useQuery<NhaDauTuDetail, Error>({
    queryKey: investorKeys.detail(maNDT),
    queryFn: () => {
      if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
      return InvestorService.getInvestorDetails(maNDT);
    },
    enabled: !!maNDT,
    staleTime: 1000 * 60 * 10, // Chi tiết NDT (10 phút)
  });
};

/** Hook lấy danh sách TKNH của một NĐT */
export const useGetInvestorBankAccountsQuery = (maNDT: string | undefined) => {
  return useQuery<TaiKhoanNganHang[], Error>({
    queryKey: investorKeys.bankAccounts(maNDT),
    queryFn: () => {
      if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
      return InvestorService.getInvestorBankAccounts(maNDT);
    },
    enabled: !!maNDT,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

/** Hook lấy số dư các TKNH của NĐT */
export const useGetInvestorBalancesQuery = (maNDT: string | undefined) => {
  return useQuery<TaiKhoanNganHang[], Error>({
    queryKey: investorKeys.balances(maNDT),
    queryFn: () => {
      if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
      return InvestorService.getInvestorBalances(maNDT);
    },
    enabled: !!maNDT,
    staleTime: 1000 * 60, // Số dư thay đổi thường xuyên hơn (1 phút)
  });
};

/** Hook lấy danh mục cổ phiếu của NĐT */
export const useGetInvestorPortfolioQuery = (maNDT: string | undefined) => {
  return useQuery<PortfolioResponse, Error>({
    queryKey: investorKeys.portfolio(maNDT),
    queryFn: () => {
      if (!maNDT) return Promise.reject(new Error("Mã NDT là bắt buộc"));
      return InvestorService.getInvestorPortfolio(maNDT);
    },
    enabled: !!maNDT,
    staleTime: 1000 * 60 * 2, // Danh mục thay đổi sau mỗi giao dịch khớp (2 phút)
  });
};

// --- Queries cho Sao kê NDT (Admin xem) ---
const useInvestorStatementQuery = <T>(
  queryKeyFn: (
    maNDT: string | undefined,
    range: { tuNgay?: string; denNgay?: string }
  ) => readonly unknown[],
  queryFnService: (
    maNDT: string,
    tuNgay: string,
    denNgay: string
  ) => Promise<T>,
  maNDT: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isValid = !!maNDT && !!tuNgay && !!denNgay;
  const range = { tuNgay, denNgay };
  return useQuery<T, Error>({
    queryKey: queryKeyFn(maNDT, range),
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new Error("Mã NDT, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
        );
      // Ép kiểu vì đã kiểm tra isValid
      return queryFnService(
        maNDT as string,
        tuNgay as string,
        denNgay as string
      );
    },
    enabled: isValid,
    staleTime: 1000 * 60, // Sao kê có thể cần cập nhật tương đối thường xuyên (1 phút)
  });
};

export const useGetInvestorOrderStatementQuery = (
  maNDT: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) =>
  useInvestorStatementQuery<OrderStatementResponse>(
    investorKeys.orderStatement,
    InvestorService.getInvestorOrderStatement,
    maNDT,
    tuNgay,
    denNgay
  );

export const useGetInvestorMatchedStatementQuery = (
  maNDT: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) =>
  useInvestorStatementQuery<MatchedOrderStatementResponse>(
    investorKeys.matchedStatement,
    InvestorService.getInvestorMatchedOrderStatement,
    maNDT,
    tuNgay,
    denNgay
  );

export const useGetInvestorCashStatementQuery = (
  maNDT: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) =>
  useInvestorStatementQuery<CashStatementResponse>(
    investorKeys.cashStatement,
    InvestorService.getInvestorCashStatement,
    maNDT,
    tuNgay,
    denNgay
  );

// --- Mutations (Dành cho Admin quản lý NDT) ---

/** Hook để tạo mới NĐT (chưa bao gồm set password) */
export const useCreateInvestorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<NhaDauTuDetail, Error, CreateNdtPayload>({
    mutationFn: InvestorService.createInvestor,
    onSuccess: (newInvestor) => {
      console.log("Investor created:", newInvestor);
      queryClient.invalidateQueries({ queryKey: investorKeys.lists() });
      // Nhắc nhở admin cần set password
      alert(
        `Nhà đầu tư ${newInvestor.MaNDT} đã được tạo. Vui lòng đặt mật khẩu ban đầu cho họ.`
      );
    },
    onError: (error: any) => {
      console.error("Create investor failed:", error);
    },
  });
};

/** Hook để cập nhật thông tin NĐT */
export const useUpdateInvestorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    NhaDauTuDetail,
    Error,
    { maNDT: string; ndtData: UpdateNdtPayload }
  >({
    mutationFn: ({ maNDT, ndtData }) =>
      InvestorService.updateInvestor(maNDT, ndtData),
    onSuccess: (updatedInvestor, variables) => {
      console.log("Investor updated:", updatedInvestor);
      // Invalidate cả list và detail
      queryClient.invalidateQueries({ queryKey: investorKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: investorKeys.detail(variables.maNDT),
      });
      // Hoặc setQueryData trực tiếp
      // queryClient.setQueryData(investorKeys.detail(variables.maNDT), updatedInvestor);
    },
    onError: (error: any) => {
      console.error("Update investor failed:", error);
    },
  });
};

/** Hook để xóa NĐT */
export const useDeleteInvestorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SimpleMessageResponse, Error, { maNDT: string }>({
    mutationFn: ({ maNDT }) => InvestorService.deleteInvestor(maNDT),
    onSuccess: (data, variables) => {
      console.log("Investor deleted:", variables.maNDT, data.message);
      // Invalidate cả list và detail (hoặc remove cache detail)
      queryClient.invalidateQueries({ queryKey: investorKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: investorKeys.detail(variables.maNDT),
      }); // Hoặc removeQueries
    },
    onError: (error: any) => {
      console.error("Delete investor failed:", error);
    },
  });
};

// --- Mutations cho TK Ngân hàng (Admin) ---

/** Hook để thêm TKNH cho NĐT */
export const useAddInvestorBankAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    TaiKhoanNganHang,
    Error,
    { maNDT: string; tknhData: CreateUpdateTknhPayload }
  >({
    mutationFn: ({ maNDT, tknhData }) =>
      InvestorService.addInvestorBankAccount(maNDT, tknhData),
    onSuccess: (newAccount, variables) => {
      console.log("Bank account added:", newAccount);
      // Invalidate danh sách TKNH và có thể cả chi tiết NDT (nếu chi tiết NDT chứa TKNH)
      queryClient.invalidateQueries({
        queryKey: investorKeys.bankAccounts(variables.maNDT),
      });
      queryClient.invalidateQueries({
        queryKey: investorKeys.detail(variables.maNDT),
      });
    },
    onError: (error: any) => {
      console.error("Add bank account failed:", error);
    },
  });
};

/** Hook để nạp tiền vào tài khoản của NĐT */
export const useDepositToInvestorAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    Error,
    { maNDT: string; maTK: string; soTien: number; ghiChu?: string }
  >({
    mutationFn: ({ maNDT, maTK, soTien, ghiChu }) =>
      InvestorService.depositToInvestorAccount(maNDT, maTK, soTien, ghiChu),
    onSuccess: (data, variables) => {
      console.log("Deposit successful:", data.message);
      // Invalidate số dư và chi tiết NĐT liên quan
      queryClient.invalidateQueries({
        queryKey: investorKeys.balances(variables.maNDT),
      });
      queryClient.invalidateQueries({
        queryKey: investorKeys.detail(variables.maNDT),
      });
    },
    onError: (error: any) => {
      console.error("Deposit failed:", error);
    },
  });
};

/** Hook để rút tiền từ tài khoản của NĐT */
export const useWithdrawFromInvestorAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    Error,
    { maNDT: string; maTK: string; soTien: number; ghiChu?: string }
  >({
    mutationFn: ({ maNDT, maTK, soTien, ghiChu }) =>
      InvestorService.withdrawFromInvestorAccount(maNDT, maTK, soTien, ghiChu),
    onSuccess: (data, variables) => {
      console.log("Withdrawal successful:", data.message);
      // Invalidate số dư và chi tiết NĐT liên quan
      queryClient.invalidateQueries({
        queryKey: investorKeys.balances(variables.maNDT),
      });
      queryClient.invalidateQueries({
        queryKey: investorKeys.detail(variables.maNDT),
      });
    },
    onError: (error: any) => {
      console.error("Withdrawal failed:", error);
    },
  });
};

/** Hook để cập nhật TKNH */
// export const useUpdateInvestorBankAccountMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation<
//     TaiKhoanNganHang,
//     Error,
//     { maTK: string; tknhData: Partial<CreateUpdateTknhPayload>; maNDT?: string }
//   >({
//     // Thêm maNDT để invalidate
//     mutationFn: ({ maTK, tknhData }) =>
//       InvestorService.updateInvestorBankAccount(maTK, tknhData),
//     onSuccess: (updatedAccount, variables) => {
//       console.log("Bank account updated:", updatedAccount);
//       // Invalidate danh sách TKNH của NĐT liên quan
//       // Cần có maNDT để invalidate đúng key. Truyền maNDT vào mutation variables nếu cần.
//       const maNDT = variables.maNDT || updatedAccount.MaNDT; // Lấy maNDT từ biến hoặc kết quả
//       if (maNDT) {
//         queryClient.invalidateQueries({
//           queryKey: investorKeys.bankAccounts(maNDT),
//         });
//         queryClient.invalidateQueries({ queryKey: investorKeys.detail(maNDT) });
//         queryClient.invalidateQueries({
//           queryKey: investorKeys.balances(maNDT),
//         }); // Cả số dư
//       } else {
//         // Invalidate rộng hơn nếu không biết maNDT
//         queryClient.invalidateQueries({ queryKey: investorKeys.details() });
//       }
//     },
//     onError: (error: any) => {
//       console.error("Update bank account failed:", error);
//     },
//   });
// };

// /** Hook để xóa TKNH */
// export const useDeleteInvestorBankAccountMutation = () => {
//   const queryClient = useQueryClient();
//   // Cần biết MaNDT để invalidate cache sau khi xóa thành công
//   return useMutation<
//     SimpleMessageResponse,
//     Error,
//     { maTK: string; maNDT?: string }
//   >({
//     mutationFn: ({ maTK }) => InvestorService.deleteInvestorBankAccount(maTK),
//     onSuccess: (data, variables) => {
//       console.log("Bank account deleted:", variables.maTK, data.message);
//       const maNDT = variables.maNDT;
//       if (maNDT) {
//         queryClient.invalidateQueries({
//           queryKey: investorKeys.bankAccounts(maNDT),
//         });
//         queryClient.invalidateQueries({ queryKey: investorKeys.detail(maNDT) });
//         queryClient.invalidateQueries({
//           queryKey: investorKeys.balances(maNDT),
//         });
//       } else {
//         queryClient.invalidateQueries({ queryKey: investorKeys.details() });
//       }
//     },
//     onError: (error: any) => {
//       console.error("Delete bank account failed:", error);
//     },
//   });
// };

/** Hook để lấy sao kê chi tiết tài khoản tiền của NĐT */
export const useGetInvestorAccountCashStatementDetailQuery = (
  maNDT: string | undefined,
  maTK: string | undefined,
  tuNgay: string | undefined,
  denNgay: string | undefined
) => {
  const isValid = !!maNDT && !!maTK && !!tuNgay && !!denNgay;
  const queryKey = [
    ...investorKeys.detail(maNDT),
    "accounts",
    maTK,
    "cash-statement-detail",
    { tuNgay, denNgay },
  ] as const;

  return useQuery<any, Error>({
    queryKey,
    queryFn: () => {
      if (!isValid)
        return Promise.reject(
          new Error("Mã NDT, Mã TK, Ngày bắt đầu, Ngày kết thúc là bắt buộc")
        );
      return InvestorService.getInvestorAccountCashStatementDetail(
        maNDT as string,
        maTK as string,
        tuNgay as string,
        denNgay as string
      );
    },
    enabled: isValid,
    staleTime: 1000 * 60, // 1 phút
  });
};
