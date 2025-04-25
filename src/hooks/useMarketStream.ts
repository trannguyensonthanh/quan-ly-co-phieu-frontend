/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useMarketStream.ts
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TokenService from "../services/token.service"; // Để lấy token nếu cần (hoặc dùng cookie)
import { marketKeys } from "../queries/stock.queries"; // Import query keys (hoặc từ market.queries.ts)
import type {
  MarketBoardItem,
  StockMarketDetail,
} from "../services/market.service"; // Import kiểu dữ liệu

const API_BASE_URL = "http://localhost:3000/api";
const SSE_ENDPOINT = `${API_BASE_URL}/market/stream`;

export const useMarketStream = () => {
  const queryClient = useQueryClient();
  // Dùng useRef để lưu instance EventSource, tránh tạo lại mỗi lần re-render
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Chỉ thiết lập kết nối nếu người dùng đã đăng nhập
    const token = TokenService.getLocalAccessToken();
    if (!token) {
      console.log("[SSE Hook] No token found, SSE connection not established.");
      // Đảm bảo đóng kết nối cũ nếu user logout
      if (eventSourceRef.current) {
        console.log(
          "[SSE Hook] Closing existing SSE connection due to logout."
        );
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // Nếu chưa có kết nối hoặc kết nối đã đóng -> tạo mới
    if (
      !eventSourceRef.current ||
      eventSourceRef.current.readyState === EventSource.CLOSED
    ) {
      console.log("[SSE Hook] Establishing SSE connection to", SSE_ENDPOINT);

      // Tạo EventSource.
      // Lưu ý: EventSource gốc không hỗ trợ gửi header tùy chỉnh (như x-access-token) một cách trực tiếp
      // Nếu backend YÊU CẦU token trong header cho SSE (ngoài cookie), bạn cần giải pháp khác:
      // 1. Dùng thư viện polyfill/wrapper cho EventSource hỗ trợ header.
      // 2. Sửa backend để đọc token từ query param (?token=...) khi init SSE (kém an toàn hơn).
      // 3. **TỐT NHẤT:** Dựa vào cookie httpOnly 'refreshToken' để backend xác thực phiên SSE (nếu backend đã làm).
      // Với code backend hiện tại đang dùng verifyToken (kiểm tra header x-access-token), cách đơn giản nhất là tạm thời bỏ verifyToken khỏi route SSE hoặc sửa backend đọc token từ query param.
      // Giả sử backend không cần token header cho SSE mà dựa vào session/cookie khác, hoặc đã bỏ verifyToken:
      eventSourceRef.current = new EventSource(SSE_ENDPOINT, {
        withCredentials: true,
      }); // withCredentials để gửi cookie

      eventSourceRef.current.onopen = () => {
        console.log("[SSE Hook] Connection opened.");
      };

      // Lắng nghe sự kiện mặc định 'message' (nếu backend gửi không kèm event name)
      // eventSourceRef.current.onmessage = (event) => { ... }

      // Lắng nghe sự kiện tùy chỉnh 'marketUpdate' (cho cập nhật giá khớp, OHLC)
      eventSourceRef.current.addEventListener(
        "marketUpdate",
        (event: MessageEvent) => {
          try {
            const updatedStockData: StockMarketDetail = JSON.parse(event.data);
            console.log("[SSE marketUpdate] Received:", updatedStockData);

            const maCP = updatedStockData.MaCP;

            // --- Cập nhật React Query Cache ---
            // 1. Cập nhật cache của bảng giá tổng hợp (marketKeys.board())
            queryClient.setQueryData<MarketBoardItem[]>(
              marketKeys.board(),
              (oldData) => {
                if (!oldData)
                  return [
                    {
                      ...updatedStockData,
                      TongKLDatMua: 0,
                      TongKLDatBan: 0,
                    } as MarketBoardItem,
                  ]; // Nếu chưa có cache thì tạo mới
                // Tìm và thay thế hoặc thêm mới dòng cho mã CP này
                const index = oldData.findIndex((item) => item.MaCP === maCP);
                if (index !== -1) {
                  // Cập nhật dòng cũ
                  const newData = [...oldData];
                  newData[index] = {
                    ...newData[index],
                    ...updatedStockData,
                    TongKLDatMua: newData[index].TongKLDatMua ?? 0,
                    TongKLDatBan: newData[index].TongKLDatBan ?? 0,
                  } as MarketBoardItem; // Merge dữ liệu mới
                  return newData;
                } else {
                  // Thêm dòng mới (ít xảy ra với marketUpdate)
                  return [
                    ...oldData,
                    {
                      ...updatedStockData,
                      TongKLDatMua: 0,
                      TongKLDatBan: 0,
                    } as MarketBoardItem,
                  ].sort((a, b) => a.MaCP.localeCompare(b.MaCP));
                }
              }
            );

            // 2. Cập nhật cache chi tiết của mã CP này (nếu có component đang query)
            queryClient.setQueryData<StockMarketDetail>(
              marketKeys.stockDetail(maCP),
              (oldDetail) => {
                // Luôn ghi đè cache chi tiết bằng dữ liệu mới nhất từ SSE
                return updatedStockData;
              }
            );
          } catch (error) {
            console.error(
              "[SSE marketUpdate] Error processing message:",
              error
            );
          }
        }
      );

      // Lắng nghe sự kiện tùy chỉnh 'orderBookUpdate' (cho cập nhật Top 3 giá/KL chờ)
      eventSourceRef.current.addEventListener(
        "orderBookUpdate",
        (event: MessageEvent) => {
          try {
            const updatedStockData: StockMarketDetail = JSON.parse(event.data); // Giả sử vẫn gửi cả dòng market data
            console.log("[SSE orderBookUpdate] Received:", updatedStockData);
            const maCP = updatedStockData.MaCP;

            // --- Cập nhật React Query Cache (tương tự marketUpdate) ---
            queryClient.setQueryData<any>(marketKeys.board(), (oldData) => {
              if (!oldData) return [updatedStockData];
              const index = oldData.findIndex((item) => item.MaCP === maCP);
              if (index !== -1) {
                const newData = [...oldData];
                // Chỉ cập nhật các trường liên quan đến sổ lệnh chờ (Top3 Mua/Bán)
                // Hoặc cập nhật toàn bộ nếu cấu trúc dữ liệu giống nhau
                newData[index] = {
                  ...newData[index], // Giữ lại OHLC, giá khớp...
                  GiaMua1: updatedStockData.GiaMua1,
                  KLMua1: updatedStockData.KLMua1,
                  GiaMua2: updatedStockData.GiaMua2,
                  KLMua2: updatedStockData.KLMua2,
                  GiaMua3: updatedStockData.GiaMua3,
                  KLMua3: updatedStockData.KLMua3,
                  GiaBan1: updatedStockData.GiaBan1,
                  KLBan1: updatedStockData.KLBan1,
                  GiaBan2: updatedStockData.GiaBan2,
                  KLBan2: updatedStockData.KLBan2,
                  GiaBan3: updatedStockData.GiaBan3,
                  KLBan3: updatedStockData.KLBan3,
                };
                return newData;
              } else {
                return [...oldData, updatedStockData].sort((a, b) =>
                  a.MaCP.localeCompare(b.MaCP)
                );
              }
            });

            // Cập nhật cache chi tiết
            queryClient.setQueryData<StockMarketDetail>(
              marketKeys.stockDetail(maCP),
              (oldDetail) => {
                if (!oldDetail) return updatedStockData;
                return { ...oldDetail /* chỉ cập nhật trường sổ lệnh */ }; // Cập nhật chi tiết hơn nếu cần
              }
            );
          } catch (error) {
            console.error(
              "[SSE orderBookUpdate] Error processing message:",
              error
            );
          }
        }
      );

      eventSourceRef.current.onerror = (error) => {
        console.error("[SSE Hook] Connection error:", error);
        // EventSource tự động thử kết nối lại, nhưng có thể thêm logic log hoặc đóng hẳn nếu lỗi liên tục
        // eventSourceRef.current?.close(); // Đóng nếu muốn dừng thử lại
        // eventSourceRef.current = null;
      };
    }

    // Cleanup function: Đóng kết nối khi component unmount hoặc user logout
    return () => {
      if (eventSourceRef.current) {
        console.log("[SSE Hook] Closing SSE connection on cleanup.");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [queryClient]); // Dependency là queryClient để có thể cập nhật cache
};
