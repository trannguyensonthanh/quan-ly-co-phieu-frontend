/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/trading.queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TradingService from "../services/trading.service";
import { toast } from "sonner";
// Import kiểu dữ liệu
import type {
  PlaceOrderPayload,
  PlaceOrderResponse,
  CancelOrderResponse,
  ModifyInfo,
} from "../services/trading.service";

// Import các query keys cần invalidate
import { portfolioKeys } from "./portfolio.queries"; // Để invalidate số dư, danh mục
import { statementKeys } from "./statement.queries"; // Để invalidate sao kê lệnh

// --- Mutations (Dành cho NDT thực hiện) ---

/**
 * Hook để đặt lệnh Mua hoặc Bán.
 */
export const usePlaceOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PlaceOrderResponse,
    Error,
    { orderData: PlaceOrderPayload; type: "B" | "M" }
  >({
    mutationFn: ({ orderData, type }) => {
      if (type === "M") {
        return TradingService.placeBuyOrder(orderData);
      } else {
        return TradingService.placeSellOrder(orderData);
      }
    },
    onSuccess: (data, variables) => {
      const action = variables.type === "M" ? "Mua" : "Bán";
      console.log(`Place ${action} order successful:`, data.order);

      // Sau khi đặt lệnh thành công:
      // 1. Invalidate sao kê lệnh để thấy lệnh mới
      queryClient.invalidateQueries({ queryKey: statementKeys.orders({}) }); // Invalidate base key cho orders

      // 2. Nếu là lệnh Mua, số dư tiền đã thay đổi -> invalidate số dư
      if (variables.type === "M") {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.balances() });
        // Có thể cần invalidate sao kê tiền mặt nếu đang xem
        queryClient.invalidateQueries({ queryKey: statementKeys.cash({}) });
      }
      // 3. Nếu là lệnh Bán, số lượng CP "khả dụng" (chưa tính chờ khớp) đã thay đổi
      //    React Query không tự biết số lượng khả dụng, nhưng có thể invalidate portfolio
      //    để user biết là có lệnh bán đang chờ (dù số lượng hiển thị chưa đổi).
      if (variables.type === "B") {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.stocks() });
      }
    },
    onError: (error: any, variables) => {
      const action = variables.type === "B" ? "Mua" : "Bán";
      console.error(`Place ${action} order failed:`, error);
      // Hiển thị lỗi cho người dùng (error.message)
    },
  });
};

/**
 * Hook để hủy lệnh đặt.
 */
export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CancelOrderResponse,
    Error,
    { maGD: number; sessionState: string }
  >({
    mutationFn: ({ maGD, sessionState }) =>
      TradingService.cancelOrder(maGD, sessionState),
    onSuccess: (data, variables) => {
      console.log(`Cancel order ${variables.maGD} successful:`, data.message);

      // Sau khi hủy lệnh thành công:
      // 1. Invalidate sao kê lệnh để cập nhật trạng thái lệnh thành 'Hủy'
      queryClient.invalidateQueries({ queryKey: statementKeys.orders({}) });

      // 2. Nếu lệnh bị hủy là lệnh Mua, tiền đã được hoàn lại -> invalidate số dư
      //    Chúng ta không biết chắc chắn lệnh bị hủy là mua hay bán ở đây,
      //    nên cách đơn giản là invalidate cả số dư và portfolio.
      queryClient.invalidateQueries({ queryKey: portfolioKeys.balances() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.stocks() });
      // Cũng invalidate sao kê tiền mặt
      queryClient.invalidateQueries({ queryKey: statementKeys.cash({}) });

      // Hiển thị thông báo thành công
    },
    onError: (error: any, variables) => {
      console.error(`Cancel order ${variables.maGD} failed:`, error);
      // Hiển thị lỗi cho người dùng
    },
  });
};

/**
 * Hook để sửa lệnh LO.
 */
export const useModifyOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PlaceOrderResponse,
    Error,
    { maGD: number; updatedOrderData: Partial<ModifyInfo> }
  >({
    mutationFn: ({ maGD, updatedOrderData }) =>
      TradingService.modifyOrder(maGD, updatedOrderData),
    onSuccess: (data, variables) => {
      console.log(`Modify order ${variables.maGD} successful:`, data.order);

      // Sau khi sửa lệnh thành công:
      // 1. Invalidate sao kê lệnh để cập nhật trạng thái lệnh
      queryClient.invalidateQueries({ queryKey: statementKeys.orders({}) });

      // 2. Invalidate số dư và danh mục để đảm bảo dữ liệu được cập nhật
      queryClient.invalidateQueries({ queryKey: portfolioKeys.balances() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.stocks() });
      queryClient.invalidateQueries({ queryKey: statementKeys.cash({}) });

      // Hiển thị thông báo thành công
    },
    onError: (error: any, variables) => {
      console.error(`Modify order ${variables.maGD} failed:`, error);
      // Hiển thị lỗi cho người dùng
    },
  });
};
