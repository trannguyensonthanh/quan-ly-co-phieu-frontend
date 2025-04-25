// src/services/user.service.ts
import TokenService from "@/services/token.service";
import apiHelper from "./apiHelper";

const API_URL = "/user";

// Định nghĩa kiểu dữ liệu profile trả về (khớp với model backend đã sửa)
// Giả định NhanVien và NDT có các trường profile giống nhau (trừ MKGD/PasswordHash đã bỏ)
interface UserProfile {
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
  // Các trường profile khác nếu có
}

/**
 * Lấy thông tin profile của người dùng đang đăng nhập.
 * Yêu cầu đã đăng nhập (có access token hợp lệ).
 * @returns {Promise<UserProfile>} Thông tin profile.
 */
const getMyProfile = (): Promise<UserProfile> => {
  const token = TokenService.getLocalAccessToken();
  return apiHelper.get(`${API_URL}/me`, token);
};

const UserService = {
  getMyProfile,
  // Thêm các hàm khác liên quan đến user nếu cần (ví dụ: cập nhật profile - cần API backend riêng)
};

export default UserService;
