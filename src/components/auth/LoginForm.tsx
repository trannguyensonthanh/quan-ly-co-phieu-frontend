import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Eye, EyeOff, KeyRound, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoginMutation } from "@/queries/auth.queries";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(20, "Mật khẩu không được vượt quá 20 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    mutate: loginMutation,
    isPending: isLoginPending,
    isError: isLoginError,
    error: loginErrorResponse,
    isSuccess: isLoginSuccess,
    data: loginData,
  } = useLoginMutation();

  useEffect(() => {
    if (isLoginSuccess) {
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      });
      login(loginData);
      navigate("/");
    }

    if (isLoginError && loginErrorResponse) {
      setLoginError(
        loginErrorResponse.message || "Có lỗi xảy ra khi đăng nhập"
      );
    }
  }, [
    isLoginSuccess,
    isLoginError,
    login,
    loginData,
    loginErrorResponse,
    navigate,
    toast,
  ]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      loginMutation({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      setLoginError("Có lỗi xảy ra khi đăng nhập");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg shadow-sm p-6 space-y-6 bg-white dark:bg-gray-800">
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Đăng nhập
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nhập thông tin đăng nhập để truy cập tài khoản của bạn
          </p>
        </div>

        {loginError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Tên đăng nhập"
                className="pl-9 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoComplete="username"
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="pl-9 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoComplete="current-password"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2"> </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline dark:text-blue-400"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline dark:text-blue-400"
            >
              Đăng ký
            </Link>
          </p>
        </div>

        <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            Tài khoản mẫu:
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
            <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <p>
                <strong>Nhà đầu tư:</strong>
              </p>
              <p>Username: NDT001</p>
              <p>Password: sonthanh123</p>
            </div>
            <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <p>
                <strong>Nhân viên:</strong>
              </p>
              <p>Username: NV001</p>
              <p>Password: sonthanh123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
