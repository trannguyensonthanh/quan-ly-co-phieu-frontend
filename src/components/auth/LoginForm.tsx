
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Đăng nhập vào tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên đăng nhập" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Nhập mật khẩu" 
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Đang xử lý..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <div className="text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Button variant="link" className="p-0" onClick={() => navigate("/register")}>
            Đăng ký
          </Button>
        </div>
        <div className="w-full border-t pt-4 text-center">
          <p className="text-xs text-gray-500">Tài khoản mẫu:</p>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-600">
            <div>
              <p><strong>Nhà đầu tư:</strong></p>
              <p>Tên đăng nhập: investor1</p>
              <p>Mật khẩu: investor123</p>
            </div>
            <div>
              <p><strong>Nhân viên:</strong></p>
              <p>Tên đăng nhập: employee1</p>
              <p>Mật khẩu: employee123</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
