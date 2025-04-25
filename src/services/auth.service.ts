/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts
import apiHelper from "./apiHelper"; // Import helper và kiểu lỗi
import TokenService from "./token.service";

// Định nghĩa kiểu dữ liệu trả về từ API signin (khớp với backend)
export interface SignInData {
  id: string | number;
  username: string;
  email?: string | null;
  role: "NhanVien" | "NhaDauTu";
  accessToken: string;
}

export interface UserProfile {
  id?: string | number; // ID có thể không trả về từ /me
  MaNDT?: string; // Hoặc MaNV
  MaNV?: string;
  HoTen: string;
  NgaySinh?: string | Date | null;
  DiaChi: string;
  Phone: string;
  CMND: string;
  GioiTinh: "Nam" | "Nữ";
  Email?: string | null;
}

// Định nghĩa kiểu dữ liệu cho API signup (khớp với backend body)
export interface SignUpPayload {
  MaNDT: string;
  password?: string; // Password có thể không cần gửi lại từ backend
  confirmPassword?: string; // Không gửi đi
  HoTen: string;
  NgaySinh?: string | Date | null; // Linh hoạt kiểu ngày
  DiaChi: string;
  Phone: string;
  CMND: string;
  GioiTinh: "Nam" | "Nữ";
  Email?: string | null;
}

// Kiểu dữ liệu trả về từ API signup thành công
export interface SignUpResponse {
  message: string;
  user: Omit<SignUpPayload, "password" | "confirmPassword">; // Bỏ password khỏi user trả về
}

// Kiểu dữ liệu cho API đổi mật khẩu
export interface ChangePasswordPayload {
  oldPassword?: string; // Có thể cần nếu dùng lại interface này
  newPassword?: string;
}

// Kiểu dữ liệu trả về chung (ví dụ: chỉ có message)
export interface SimpleMessageResponse {
  message: string;
}

// --- Bắt đầu Service ---
const API_URL = "/auth";

/**
 * Thực hiện đăng ký Nhà Đầu Tư mới.
 * @param signUpData Dữ liệu đăng ký.
 * @returns Promise chứa thông tin user đã đăng ký (không có pw) hoặc lỗi.
 */
const signup = (
  signUpData: SignUpPayload,
  token = ""
): Promise<SignUpResponse> => {
  // Có thể loại bỏ confirmPassword trước khi gửi nếu cần
  return apiHelper.post(`${API_URL}/signup`, signUpData);
};

/**
 * Thực hiện đăng nhập.
 * Lưu token vào localStorage nếu thành công.
 * @param username
 * @param password
 * @returns Promise chứa thông tin user và access token.
 */
const signin = async (
  username: string,
  password?: string
): Promise<SignInData> => {
  // Password có thể optional nếu logic thay đổi
  if (!password) {
    throw new Error("Password is required for signin."); // Hoặc ném lỗi BadRequest
  }
  try {
    const userData = await apiHelper.post(`${API_URL}/signin`, {
      username,
      password,
    });
    if (userData?.accessToken) {
      // Lưu thông tin user vào localStorage
      TokenService.setUser(userData); // Hàm setUser đã có kiểu StoredUser
    } else {
      // Xử lý trường hợp API thành công nhưng không trả về token? (ít xảy ra)
      console.warn("Signin successful but no access token received.");
      // Có thể throw lỗi ở đây nếu token là bắt buộc
    }
    return userData;
  } catch (error) {
    // Xóa thông tin user cũ nếu đăng nhập thất bại (tùy chọn)
    // TokenService.removeUser();
    console.error("Signin failed:", error);
    throw error; // Ném lại lỗi (đã được xử lý bởi apiHelper) để component bắt
  }
};

export const refreshToken = async (
  data = {},
  tokenIgnored = ""
): Promise<{ accessToken: string }> => {
  const API_BASE_URL: string = "http://localhost:3000/api";
  try {
    // Gọi fetch trực tiếp, KHÔNG qua fetchWithAuth
    const res = await fetch(API_BASE_URL + "/auth/refreshtoken", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenIgnored}`, // Gửi token cũ để xác thực
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));
    console.log("Refresh token result:", result); // Log kết quả để kiểm tra
    if (!res.ok) {
      throw new Error(
        result.message || `Refresh token failed with status ${res.status}`
      );
    }
    if (!result.accessToken) {
      throw new Error("Refresh response missing accessToken");
    }
    return result as { accessToken: string };
  } catch (error: any) {
    console.error("API call to refresh token failed:", error);
    throw error;
  }
};

export const logoutUserApi = async (token = ""): Promise<any> => {
  const API_BASE_URL: string = "http://localhost:3000/api";
  try {
    const res = await fetch(API_BASE_URL + "/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Gửi Authorization nếu API backend yêu cầu token để biết logout user nào
        // (mặc dù khi refresh fail thì token này có thể đã hết hạn)
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include", // Gửi cookie (nếu có)
      body: JSON.stringify({}), // Không cần body nếu API không yêu cầu
    });
    // Không cần quan tâm nhiều đến kết quả response logout, chỉ cần gọi là chính
    if (!res.ok) {
      console.warn(`API call to /auth/logout failed with status ${res.status}`);
    }
    return res.json().catch(() => ({})); // Trả về kết quả hoặc object rỗng
  } catch (error) {
    console.error("API call to /auth/logout failed:", error);
    throw error; // Ném lỗi để có thể bắt ở nơi gọi nếu cần
  }
};

/**
 * Thực hiện đăng xuất.
 * Xóa user khỏi localStorage và gọi API backend để xóa cookie.
 * @returns Promise (có thể không cần giá trị trả về cụ thể).
 */
const logout = async (): Promise<SimpleMessageResponse> => {
  try {
    const token = TokenService.getLocalAccessToken(); // Lấy token từ localStorage
    // Gọi API backend để yêu cầu xóa httpOnly cookie
    const response = await apiHelper.post(`${API_URL}/logout`, {}, token, {
      credentials: "include",
    });
    // Luôn xóa user khỏi localStorage bất kể API thành công hay không
    TokenService.removeUser();
    return response; // Trả về message từ backend
  } catch (error) {
    console.error(
      "Logout API call failed (token might already be invalid):",
      error
    );
    // Vẫn nên xóa user khỏi localStorage ngay cả khi API lỗi
    TokenService.removeUser();
    // Có thể throw lỗi hoặc trả về một trạng thái mặc định
    // throw error; // Ném lỗi để component biết
    return { message: "Đã xóa thông tin đăng nhập cục bộ." }; // Hoặc trả về message nhẹ nhàng
  }
};

/**
 * Thực hiện đổi mật khẩu cho user đang đăng nhập.
 * @param oldPassword Mật khẩu cũ.
 * @param newPassword Mật khẩu mới.
 * @returns Promise chứa message thành công hoặc lỗi.
 */
const changePassword = (
  oldPassword: string,
  newPassword: string
): Promise<SimpleMessageResponse> => {
  const token = TokenService.getLocalAccessToken();
  const payload: ChangePasswordPayload = { oldPassword, newPassword };
  return apiHelper.put(`${API_URL}/change-password`, payload, token);
};

// Export service object
const AuthService = {
  signup,
  signin,
  logout,
  changePassword,
  getCurrentUser: TokenService.getLocalUser, // Tiện ích lấy user đang đăng nhập
};

export default AuthService;
