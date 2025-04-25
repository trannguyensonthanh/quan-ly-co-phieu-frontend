/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockUsers } from "@/utils/mock-data";
import { Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useGetAllUsersQuery,
  useResetUserPasswordMutation,
} from "@/queries/admin.queries";

const passwordSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const PasswordChangePage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const resetUserPasswordMutation = useResetUserPasswordMutation();
  const { data: users = [], isLoading } = useGetAllUsersQuery();
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePassword = async (
    values: z.infer<typeof passwordSchema>
  ) => {
    if (!selectedUserId) return;

    try {
      await resetUserPasswordMutation.mutateAsync({
        accountId: selectedUserId.username,
        role: selectedUserId.role,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });

      toast({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu đã được cập nhật",
      });

      setShowDialog(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đổi mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đổi mật khẩu người dùng</h1>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Chọn người dùng để đổi mật khẩu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã người dùng</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.HoTen}</TableCell>
                      <TableCell>
                        {user.role === "NhaDauTu" ? "Nhà đầu tư" : "Nhân viên"}
                      </TableCell>
                      <TableCell>
                        <Dialog
                          open={
                            showDialog &&
                            selectedUserId.username === user.username
                          }
                          onOpenChange={(open) => {
                            setShowDialog(open);
                            if (!open) {
                              setSelectedUserId(null);
                              form.reset();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSelectedUserId({
                                  username: user.username,
                                  role: user.role,
                                })
                              }
                            >
                              Đổi mật khẩu
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Đổi mật khẩu cho {user.HoTen}
                              </DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit(
                                  handleChangePassword
                                )}
                                className="space-y-4"
                              >
                                <FormField
                                  control={form.control}
                                  name="password"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Mật khẩu mới</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="password"
                                          placeholder="********"
                                          {...field}
                                        />
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
                                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="password"
                                          placeholder="********"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button type="submit">Lưu thay đổi</Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Không tìm thấy người dùng phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordChangePage;
