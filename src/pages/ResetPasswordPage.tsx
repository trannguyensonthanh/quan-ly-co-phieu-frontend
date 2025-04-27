/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "@/queries/auth.queries";
import { toast } from "sonner";

// Schema validation với Zod
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(128, "Mật khẩu không được vượt quá 128 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"], // Đặt lỗi vào trường confirmPassword
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get("token"); // Lấy token từ URL

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!resetToken) {
      toast.error("Token không hợp lệ hoặc đã hết hạn");
      return;
    }

    resetPassword(
      { token: resetToken, newPassword: data.password },
      {
        onSuccess: () => {
          toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
          navigate("/login"); // Chuyển hướng đến trang login
        },
        onError: (error: any) => {
          toast.error("Đặt lại mật khẩu thất bại", {
            description: error?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
          });
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Đặt lại mật khẩu
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mật khẩu mới */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Mật khẩu mới
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu mới"
              {...form.register("password")}
              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Xác nhận mật khẩu
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              {...form.register("confirmPassword")}
              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Nút gửi */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 rounded-md"
            disabled={isPending}
          >
            {isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
