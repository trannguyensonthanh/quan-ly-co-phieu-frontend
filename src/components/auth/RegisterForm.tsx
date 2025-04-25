import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useSignupMutation } from "@/queries/auth.queries";
import { SignUpPayload } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z
  .object({
    MaNDT: z
      .string()
      .min(1, "Vui lòng nhập tên đăng nhập")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
      ),
    HoTen: z
      .string()
      .min(1, "Họ và tên là bắt buộc")
      .regex(
        /^[a-zA-ZÀ-Ỵà-ỵĂăÂâĐđÊêÔôƠơƯư\s]+$/,
        "Họ và tên phải là tiếng Việt và chỉ chứa chữ cái cùng khoảng trắng"
      ),
    Email: z.string().email("Email không hợp lệ"),
    Phone: z.string().min(1, "Số điện thoại là bắt buộc"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(20, "Mật khẩu không được vượt quá 20 ký tự"),
    confirmPassword: z.string(),
    CMND: z
      .string()
      .min(9, "Số CMND phải có ít nhất 9 ký tự")
      .max(10, "Số CMND không được vượt quá 10 ký tự")
      .regex(/^\d+$/, "Số CMND chỉ được chứa các chữ số"),
    NgaySinh: z.string().min(1, "Ngày sinh là bắt buộc"),
    GioiTinh: z.enum(["Nam", "Nữ"], {
      errorMap: () => ({ message: "Chọn giới tính" }),
    }) as z.ZodEnum<["Nam", "Nữ"]>,
    DiaChi: z.string().min(1, "Địa chỉ là bắt buộc"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const RegisterForm = () => {
  const [isHiddenPassword, setIsHiddenPassword] = useState(true);
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      MaNDT: "",
      HoTen: "",
      Email: "",
      Phone: "",
      password: "",
      confirmPassword: "",
      CMND: "",
      GioiTinh: "Nam" as "Nam" | "Nữ",
      DiaChi: "",
    },
  });

  const {
    mutate: signupMutation,
    isPending: isSignupPending,
    isError: isSignupError,
    error: signupErrorResponse,
    isSuccess: isSignupSuccess,
    data: signupData,
  } = useSignupMutation();

  useEffect(() => {
    if (isSignupSuccess) {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    }

    if (isSignupError && signupErrorResponse) {
      toast.error(signupErrorResponse.message || "Có lỗi xảy ra khi đăng ký");
    }
  }, [isSignupSuccess, isSignupError, signupErrorResponse, navigate]);

  const onSubmit = (data: SignUpPayload) => {
    console.log("Dữ liệu đăng ký:", data);
    signupMutation(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-white">
          Đăng ký tài khoản
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Tạo tài khoản để bắt đầu giao dịch trên Hanoi Stock Exchange
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="MaNDT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="MaNDT" className="text-gray-300">
                      Tên đăng nhập
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="MaNDT"
                        autoComplete="username"
                        placeholder="Nhập tên đăng nhập"
                        className="bg-gray-700 text-white placeholder-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="HoTen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="HoTen" className="text-gray-300">
                      Họ và tên
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="HoTen"
                        autoComplete="name"
                        placeholder="Nhập họ và tên đầy đủ"
                        className="bg-gray-700 text-white placeholder-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="Email" className="text-gray-300">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="Email"
                        type="email"
                        autoComplete="email"
                        placeholder="Nhập địa chỉ email"
                        className="bg-gray-700 text-white placeholder-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="Phone" className="text-gray-300">
                      Số điện thoại
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="Phone"
                        autoComplete="tel"
                        placeholder="Nhập số điện thoại"
                        className="bg-gray-700 text-white placeholder-gray-400"
                        {...field}
                      />
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
                    <FormLabel htmlFor="password" className="text-gray-300">
                      Mật khẩu
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={isHiddenPassword ? "password" : "text"}
                          autoComplete="new-password"
                          placeholder="Nhập mật khẩu"
                          className="bg-gray-700 text-white placeholder-gray-400"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                          onClick={() => setIsHiddenPassword(!isHiddenPassword)}
                        >
                          {isHiddenPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="confirmPassword"
                      className="text-gray-300"
                    >
                      Xác nhận mật khẩu
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={isHiddenPassword ? "password" : "text"}
                          autoComplete="new-password"
                          placeholder="Nhập lại mật khẩu"
                          className="bg-gray-700 text-white placeholder-gray-400"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                          onClick={() => setIsHiddenPassword(!isHiddenPassword)}
                        >
                          {isHiddenPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CMND"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="CMND" className="text-gray-300">
                      Số CMND/CCCD
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="CMND"
                        autoComplete="off"
                        placeholder="Nhập số CMND/CCCD"
                        className="bg-gray-700 text-white placeholder-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="NgaySinh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Ngày sinh</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-gray-700 text-white placeholder-gray-400"
                        {...field}
                        autoComplete="bday"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="GioiTinh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Giới tính</FormLabel>
                    <FormControl>
                      <RadioGroup
                        defaultValue="Nam"
                        onValueChange={field.onChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Nam" id="male" />
                          <FormLabel
                            htmlFor="male"
                            className="text-gray-300 cursor-pointer"
                          >
                            Nam
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Nữ" id="female" />
                          <FormLabel
                            htmlFor="female"
                            className="text-gray-300 cursor-pointer"
                          >
                            Nữ
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="DiaChi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="DiaChi" className="text-gray-300">
                    Địa chỉ
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="DiaChi"
                      autoComplete="street-address"
                      placeholder="Nhập địa chỉ đầy đủ"
                      className="bg-gray-700 text-white placeholder-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6 border-gray-700">
        <p className="text-sm text-gray-400">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-blue-400 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Đăng nhập
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
