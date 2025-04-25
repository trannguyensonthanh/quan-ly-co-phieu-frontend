/* eslint-disable @typescript-eslint/no-explicit-any */
// src/queries/auth.queries.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import TokenService from "../services/token.service"; // Cần để check login

// Import các kiểu dữ liệu nếu cần (đã định nghĩa trong service)
import type {
  SignInData,
  SignUpPayload,
  ChangePasswordPayload,
  UserProfile,
} from "../services/auth.service"; // Giả sử đã export

// --- Query Keys ---
// Thường đặt key dạng mảng để dễ quản lý và invalidation
const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const, // Key cho thông tin user profile
  // Thêm các key khác nếu cần
};

// --- Mutations ---

/**
 * Hook cho chức năng Đăng nhập (Signin).
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SignInData, Error, { username: string; password: string }>(
    {
      // Kiểu trả về, kiểu lỗi, kiểu biến đầu vào cho mutationFn
      mutationFn: ({ username, password }) =>
        AuthService.signin(username, password),
      onSuccess: (data) => {
        // Sau khi đăng nhập thành công:
        console.log("Login successful, user data:", data);
        // 1. Token đã được lưu vào localStorage bởi AuthService.signin
        // 2. Vô hiệu hóa (invalidate) các query liên quan đến trạng thái "chưa đăng nhập" (nếu có)
        // 3. Quan trọng: Vô hiệu hóa query lấy thông tin profile để nó tự động fetch lại với user mới
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
        // Có thể invalidate các query khác phụ thuộc vào user (ví dụ: portfolio, balances)
        queryClient.invalidateQueries({ queryKey: ["portfolio"] }); // Ví dụ
        queryClient.invalidateQueries({ queryKey: ["statements"] }); // Ví dụ
        // 4. (Trong component): Thực hiện redirect hoặc cập nhật UI
      },
      onError: (error) => {
        // Xử lý lỗi (ví dụ: hiển thị toast/alert)
        console.error("Login failed:", error);
        // TokenService.removeUser(); // Đảm bảo user cũ bị xóa nếu login lỗi
      },
    }
  );
};

/**
 * Hook cho chức năng Đăng ký (Signup).
 */
export const useSignupMutation = () => {
  return useMutation<any, Error, SignUpPayload>({
    // Kiểu trả về từ API signup, kiểu lỗi, kiểu payload
    mutationFn: (signUpData) => AuthService.signup(signUpData),
    onSuccess: (data) => {
      console.log("Signup successful:", data);
      // Thường sẽ redirect về trang login hoặc tự động login sau khi signup thành công
    },
    onError: (error: any) => {
      // Dùng any nếu chưa rõ kiểu lỗi cụ thể từ ApiError
      console.error("Signup failed:", error);
      // Hiển thị lỗi cho người dùng (ví dụ: error.message)
    },
  });
};

/**
 * Hook cho chức năng Đăng xuất (Logout).
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Sau khi logout thành công (API backend đã xóa cookie):
      // 1. TokenService.removeUser() đã được gọi trong AuthService.logout
      console.log("Logout successful");
      // 2. Xóa toàn bộ cache của React Query để đảm bảo không còn dữ liệu cũ
      queryClient.clear();
      // 3. (Trong component): Redirect về trang login
      if (typeof window !== "undefined") {
        window.location.href = "/login"; // Hoặc dùng navigate của router
      }
    },
    onError: (error) => {
      console.error("Logout failed (API or local):", error);
      // Dù API lỗi, vẫn nên clear cache và redirect
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });
};

/**
 * Hook cho chức năng Đổi mật khẩu.
 */
export const useChangePasswordMutation = () => {
  return useMutation<any, Error, { oldPassword: string; newPassword: string }>({
    mutationFn: ({ oldPassword, newPassword }) =>
      AuthService.changePassword(oldPassword, newPassword),
    onSuccess: (data) => {
      console.log("Password changed successfully:", data);
      // Hiển thị thông báo thành công
      // Có thể cần logout hoặc không tùy yêu cầu
    },
    onError: (error) => {
      console.error("Change password failed:", error);
      // Hiển thị lỗi cho người dùng
    },
  });
};

// --- Queries ---

/**
 * Hook để lấy thông tin profile của người dùng đang đăng nhập.
 * Tự động kích hoạt/vô hiệu hóa dựa trên trạng thái đăng nhập.
 */
export const useMyProfileQuery = () => {
  const user = TokenService.getLocalUser(); // Lấy thông tin user từ localStorage
  const isLoggedIn = !!user?.accessToken; // Kiểm tra xem có token không

  const options: UseQueryOptions<UserProfile, Error> = {
    queryKey: authKeys.profile(),
    queryFn: UserService.getMyProfile,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 15,
    // cacheTime: 1000 * 60 * 60, // Removed as it is not a valid property
  };

  return useQuery(options);
};
