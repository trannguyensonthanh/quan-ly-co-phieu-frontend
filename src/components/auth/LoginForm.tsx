import { useState } from "react";
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

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const success = await login(data.username, data.password);
      
      if (success) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn trở lại!",
        });
        navigate("/");
      } else {
        setLoginError("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      setLoginError("Có lỗi xảy ra khi đăng nhập");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg shadow-sm p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold">Đăng nhập</h3>
          <p className="text-sm text-muted-foreground">
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
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Tên đăng nhập" 
                className="pl-9" 
                {...register("username")} 
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="pl-9 pr-10"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300" />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            Tài khoản mẫu:
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
            <div className="p-2 border rounded">
              <p><strong>Nhà đầu tư:</strong></p>
              <p>Username: investor1</p>
              <p>Password: investor123</p>
            </div>
            <div className="p-2 border rounded">
              <p><strong>Nhân viên:</strong></p>
              <p>Username: employee1</p>
              <p>Password: employee123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
