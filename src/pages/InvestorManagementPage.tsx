
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUsers, mockBankAccounts, createUser, deleteUser } from "@/utils/mock-data";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/utils/types";
import { Search, UserPlus, Trash2, Pencil, Save, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";

const investorSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải theo định dạng YYYY-MM-DD"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 ký tự"),
  idNumber: z.string().min(9, "Số CMND phải có ít nhất 9 ký tự"),
  gender: z.enum(["Nam", "Nữ"]),
  initialBalance: z.coerce.number().min(0, "Số dư ban đầu không thể âm"),
  bankId: z.string().min(1, "Vui lòng chọn ngân hàng")
});

type InvestorValues = z.infer<typeof investorSchema>;

const InvestorManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingInvestorId, setEditingInvestorId] = useState<string | null>(null);
  
  const form = useForm<InvestorValues>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      birthDate: "",
      address: "",
      phone: "",
      idNumber: "",
      gender: "Nam",
      initialBalance: 0,
      bankId: "NH001"
    },
  });

  // Filter only investors
  const investors = mockUsers.filter(user => user.role === "investor");
  
  // Filter based on search term
  const filteredInvestors = investors.filter(investor => 
    investor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.phone.includes(searchTerm)
  );

  const onSubmit = (values: InvestorValues) => {
    try {
      const userToCreate: Omit<User, 'id'> = {
        username: values.username,
        fullName: values.fullName,
        email: values.email,
        birthDate: values.birthDate,
        address: values.address,
        phone: values.phone,
        idNumber: values.idNumber,
        gender: values.gender,
        role: "investor"
      };
      
      const newUser = createUser(userToCreate);
      
      // Create bank account with initial balance
      if (newUser) {
        // This would be handled in the backend normally, but we're using mock data
        mockBankAccounts.push({
          id: `TK${String(mockBankAccounts.length + 1).padStart(3, '0')}`,
          userId: newUser.id,
          balance: values.initialBalance,
          bankId: values.bankId
        });
      }
      
      setShowAddDialog(false);
      form.reset();
      
      toast({
        title: "Tạo nhà đầu tư thành công",
        description: `Đã tạo tài khoản cho ${values.fullName}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo nhà đầu tư. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvestor = (investorId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhà đầu tư này?")) {
      const deleted = deleteUser(investorId);
      
      if (deleted) {
        // Also delete their bank accounts
        const accountIndex = mockBankAccounts.findIndex(acc => acc.userId === investorId);
        if (accountIndex !== -1) {
          mockBankAccounts.splice(accountIndex, 1);
        }
        
        toast({
          title: "Xóa nhà đầu tư thành công",
          description: "Nhà đầu tư đã được xóa khỏi hệ thống",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xóa nhà đầu tư. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý nhà đầu tư</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhà đầu tư</CardTitle>
          <CardDescription>
            Quản lý thông tin nhà đầu tư và tài khoản giao dịch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm nhà đầu tư..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Thêm nhà đầu tư
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Thêm nhà đầu tư mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để tạo tài khoản cho nhà đầu tư
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên đăng nhập</FormLabel>
                            <FormControl>
                              <Input placeholder="investor123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ và tên</FormLabel>
                            <FormControl>
                              <Input placeholder="Nguyễn Văn A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="example@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="birthDate"
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
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Đường ABC, Quận XYZ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input placeholder="0912345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số CMND/CCCD</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giới tính</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="initialBalance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số dư ban đầu (VNĐ)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngân hàng</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="NH001">VietcomBank</option>
                                <option value="NH002">Techcombank</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit">Tạo nhà đầu tư</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NĐT</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Số CMND</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.length > 0 ? (
                  filteredInvestors.map((investor) => (
                    <TableRow key={investor.id}>
                      <TableCell className="font-medium">{investor.id}</TableCell>
                      <TableCell>{investor.fullName}</TableCell>
                      <TableCell>{investor.email}</TableCell>
                      <TableCell>{investor.phone}</TableCell>
                      <TableCell>{investor.idNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button variant="outline" size="icon" onClick={() => setEditingInvestorId(investor.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteInvestor(investor.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "Không tìm thấy nhà đầu tư phù hợp" : "Chưa có nhà đầu tư nào trong hệ thống"}
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

export default InvestorManagementPage;
