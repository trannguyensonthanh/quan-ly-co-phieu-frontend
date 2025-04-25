import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, deleteUser, mockUsers } from "@/utils/mock-data";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { User } from "@/utils/types";
import UserEditDialog from "@/components/users/UserEditDialog";
import {
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useGetAllUsersQuery,
  useUpdateAccountMutation,
} from "@/queries/admin.queries";

const userSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "Tên đăng nhập chỉ được chứa chữ cái và số")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
      "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số"
    ),
  HoTen: z
    .string()
    .min(1, "Họ và tên là bắt buộc")
    .regex(
      /^[a-zA-ZÀ-Ỵà-ỵĂăÂâĐđÊêÔôƠơƯư\s]+$/,
      "Họ và tên phải là tiếng Việt và chỉ chứa chữ cái cùng khoảng trắng"
    ),
  Email: z.string().email("Email không hợp lệ"),
  NgaySinh: z.string().min(1, "Ngày sinh là bắt buộc"),
  DiaChi: z.string().min(1, "Địa chỉ là bắt buộc"),
  Phone: z
    .string()
    .regex(/^\d{10,11}$/, "Số điện thoại phải có 10 hoặc 11 chữ số")
    .refine(
      (phone) => phone.startsWith("0"),
      "Số điện thoại phải bắt đầu bằng số 0"
    ),
  CMND: z.string().min(9, "CMND phải có ít nhất 9 số"),
  GioiTinh: z.enum(["Nam", "Nữ"]),
  role: z.enum(["NhaDauTu", "NhanVien"]),
});

type UserValues = z.infer<typeof userSchema>;

const UserManagementPage = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const form = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      HoTen: "",
      Email: "",
      NgaySinh: "",
      DiaChi: "",
      Phone: "",
      CMND: "",
      GioiTinh: "Nam",
      role: "NhaDauTu",
    },
  });
  const { data: usersData, isLoading, isError } = useGetAllUsersQuery();
  console.log("usersData", usersData);
  const filteredUsers =
    usersData?.filter((user) => {
      if (activeTab === "all") return true;
      if (activeTab === "NhaDauTu") return user.role === "NhaDauTu";
      if (activeTab === "NhanVien") return user.role === "NhanVien";
      return false;
    }) || [];

  console.log("filteredUsers", filteredUsers);
  console.log("activeTab", activeTab);

  const { mutate: createAccount } = useCreateAccountMutation();
  const { mutate: deleteAccount } = useDeleteAccountMutation();
  const { mutate: updateAccount } = useUpdateAccountMutation();
  const onSubmit = (values: UserValues) => {
    const userToCreate: Omit<User, "id"> = {
      username: values.username,
      HoTen: values.HoTen,
      password: values.password,
      Email: values.Email,
      NgaySinh: values.NgaySinh,
      DiaChi: values.DiaChi,
      Phone: values.Phone,
      CMND: values.CMND,
      GioiTinh: values.GioiTinh,
      role: values.role,
    };

    createAccount(userToCreate, {
      onSuccess: () => {
        toast({
          title: "Tạo tài khoản thành công",
          description: `Đã tạo tài khoản cho ${values.HoTen}`,
        });
        setOpenDialog(false);
        form.reset();
      },
      onError: (err) => {
        toast({
          title: "Lỗi tạo tài khoản",
          description: err.message || "Đã xảy ra lỗi khi tạo tài khoản mới",
          variant: "destructive",
        });
      },
    });
  };

  const handleDelete = (userId: string, role: "NhanVien" | "NhaDauTu") => {
    deleteAccount(
      { accountId: userId, role },
      {
        onSuccess: () => {
          toast({
            title: "Xóa tài khoản thành công",
            description: "Tài khoản đã được xóa khỏi hệ thống",
          });
          setConfirmDeleteId(null);
        },
        onError: (err) => {
          toast({
            title: "Lỗi xóa tài khoản",
            description: err?.message || "Đã xảy ra lỗi khi xóa tài khoản",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };
  const handleSaveUser = (userData: UserValues) => {
    if (!selectedUser) return;

    delete userData.username; // Remove username if not provided
    const updatedUser = {
      accountId: selectedUser.username,
      accountData: {
        ...selectedUser,
        ...userData,
      },
    };
    console.log("updatedUser", updatedUser);

    updateAccount(updatedUser, {
      onSuccess: () => {
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật thông tin cho ${userData.HoTen}`,
        });
        setEditDialogOpen(false);
      },
      onError: (err) => {
        toast({
          title: "Lỗi cập nhật tài khoản",
          description: err.message || "Đã xảy ra lỗi khi cập nhật tài khoản",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (isError) {
    return <div>Đã xảy ra lỗi khi tải dữ liệu người dùng.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo tài khoản mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo tài khoản mới cho nhân viên hoặc nhà đầu
                tư.
                <br />
                <strong>Lưu ý:</strong> Sau khi tạo thành công, tên đăng nhập
                (MaNDT/MaNV) sẽ không thể thay đổi.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
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
                          <Input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="HoTen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ và tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Nhập email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="NgaySinh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
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
                        <FormLabel>CMND/CCCD</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số CMND/CCCD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="GioiTinh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nam">Nam</SelectItem>
                            <SelectItem value="Nữ">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại tài khoản</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại tài khoản" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NhaDauTu">Nhà đầu tư</SelectItem>
                            <SelectItem value="NhanVien">Nhân viên</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">Tạo tài khoản</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
          <CardDescription>
            Quản lý tài khoản nhân viên và nhà đầu tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="NhaDauTu">Nhà đầu tư</TabsTrigger>
              <TabsTrigger value="NhanVien">Nhân viên</TabsTrigger>
            </TabsList>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Loại tài khoản</TableHead>
                  <TableHead className="text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.HoTen}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.Phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "NhanVien" ? "default" : "secondary"
                        }
                      >
                        {user.role === "NhanVien" ? "Nhân viên" : "Nhà đầu tư"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Dialog
                          open={confirmDeleteId === user.username}
                          onOpenChange={(isOpen) =>
                            setConfirmDeleteId(isOpen ? user.username : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                              <DialogDescription>
                                Bạn có chắc chắn muốn xóa tài khoản {user.HoTen}{" "}
                                ({user.username})? Hành động này không thể hoàn
                                tác.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Hủy
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDelete(user.username, user.role)
                                }
                              >
                                Xóa tài khoản
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-6"
                    >
                      Không có tài khoản nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <UserEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManagementPage;
