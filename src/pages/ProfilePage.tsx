import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUsers, mockBankAccounts, mockBanks } from "@/utils/mock-data";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import {
  useChangePasswordMutation,
  useMyProfileQuery,
} from "@/queries/auth.queries";
import { Eye, EyeOff } from "lucide-react";
import BankAccountsList from "@/components/profile/BankAccountsList";
// Schema validation với zod
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp với mật khẩu mới",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;
const ProfilePage = () => {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { data: profile, isLoading } = useMyProfileQuery();
  const changePasswordMutation = useChangePasswordMutation();
  // In a real app, we would get the current user from auth context

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onSubmit = async (data: PasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật mật khẩu thành công!");
          form.reset();
        },
        onError: (err) => {
          toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        },
      }
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Error loading profile</div>;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <TabsList>
                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                    <TabsTrigger value="password">Mật khẩu</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>Quản lý thông tin tài khoản</CardDescription>
              </CardHeader>

              <TabsContent value="profile">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input id="fullName" value={profile.HoTen} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile.Email} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" value={profile.Phone} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">Số CMND</Label>
                      <Input id="idNumber" value={profile.CMND} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" value={profile.DiaChi} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Ngày sinh</Label>
                      <Input
                        id="birthDate"
                        value={formatDate(
                          typeof profile.NgaySinh === "string"
                            ? profile.NgaySinh
                            : profile.NgaySinh.toISOString().split("T")[0]
                        )}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Giới tính</Label>
                      <Input id="gender" value={profile.GioiTinh} disabled />
                    </div>
                  </div>
                </CardContent>

                <CardFooter></CardFooter>
              </TabsContent>

              <TabsContent value="password">
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      {/* Mật khẩu hiện tại */}
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu hiện tại</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  type={
                                    showCurrentPassword ? "text" : "password"
                                  }
                                  placeholder="Nhập mật khẩu hiện tại"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                  onClick={() =>
                                    setShowCurrentPassword((prev) => !prev)
                                  }
                                  tabIndex={-1}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Mật khẩu mới */}
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Nhập mật khẩu mới"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                  onClick={() =>
                                    setShowNewPassword((prev) => !prev)
                                  }
                                  tabIndex={-1}
                                >
                                  {showNewPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Xác nhận mật khẩu mới */}
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Xác nhận mật khẩu mới"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                  onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                  }
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Nút hành động */}
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                          disabled={form.formState.isSubmitting}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          disabled={form.formState.isSubmitting}
                        >
                          Cập nhật mật khẩu
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
            </Card>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {profile.HoTen.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{profile.HoTen}</h3>
                  <p className="text-sm text-muted-foreground">
                    Mã NDT: {profile.MaNDT}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ngày sinh
                  </span>
                  <span>
                    {formatDate(
                      typeof profile.NgaySinh === "string"
                        ? profile.NgaySinh
                        : profile.NgaySinh.toISOString().split("T")[0]
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Giới tính
                  </span>
                  <span>{profile.GioiTinh}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span>{profile.Email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <BankAccountsList accounts={accounts} banks={mockBanks} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
