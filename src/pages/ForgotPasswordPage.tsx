import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/utils/mock-data";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForgotPasswordMutation } from "@/queries/auth.queries";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [loading, setLoading] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);

    forgotPasswordMutation.mutate(
      { email: values.email },
      {
        onSuccess: () => {
          setLoading(false);
          setSubmitted(true);
          toast({
            title: "Yêu cầu đã được gửi",
            description:
              "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
          });
        },
        onError: () => {
          toast({
            title: "Đã xảy ra lỗi",
            description:
              "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              Kiểm tra email của bạn
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-center text-muted-foreground dark:text-gray-400">
              Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn để đặt lại mật
              khẩu của bạn.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login" className="text-gray-900 dark:text-gray-100">
                Quay lại đăng nhập
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-gray-100">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-9 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại"}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                  disabled={loading}
                >
                  <Link
                    to="/login"
                    className="flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đăng nhập
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
