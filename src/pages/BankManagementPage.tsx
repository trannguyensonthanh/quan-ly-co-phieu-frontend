/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Edit, Search } from "lucide-react";
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
import { Bank } from "@/utils/types";
import BankEditDialog from "@/components/banks/BankEditDialog";
import {
  useCreateBankMutation,
  useGetAllBanksQuery,
  useUpdateBankMutation,
} from "@/queries/bank.queries";

// Sample mock data for banks
const mockBanks: Bank[] = [
  {
    MaNH: "NH001",
    TenNH: "VietcomBank",
    DiaChi: "Số 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
    Phone: "1900555577",
    Email: "vcb@vietcombank.com.vn",
  },
  {
    MaNH: "NH002",
    TenNH: "Techcombank",
    DiaChi: "Số 191 Bà Triệu, Hai Bà Trưng, Hà Nội",
    Phone: "1800588822",
    Email: "info@techcombank.com.vn",
  },
  {
    MaNH: "NH003",
    TenNH: "BIDV",
    DiaChi: "Số 35 Hàng Vôi, Hoàn Kiếm, Hà Nội",
    Phone: "1900969696",
    Email: "info@bidv.com.vn",
  },
];

// Define schema for bank creation/editing
const bankSchema = z.object({
  MaNH: z
    .string()
    .regex(/^[A-Z0-9]+$/, "Mã ngân hàng chỉ được chứa chữ cái in hoa và số")
    .min(2, "Mã ngân hàng phải có ít nhất 2 ký tự")
    .max(10, "Mã ngân hàng không được vượt quá 10 ký tự"),
  TenNH: z
    .string()
    .regex(
      /^[a-zA-ZÀ-ỹ\s]+$/u,
      "Tên ngân hàng chỉ được chứa chữ cái, khoảng trắng và dấu tiếng Việt"
    )
    .min(2, "Tên ngân hàng phải có ít nhất 2 ký tự")
    .max(50, "Tên ngân hàng không được vượt quá 50 ký tự"),
  DiaChi: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(100, "Địa chỉ không được vượt quá 100 ký tự"),
  Phone: z
    .string()
    .regex(
      /^(?:\+84|0)(?:\d){9,10}$/,
      "Số điện thoại phải bắt đầu bằng 0 và chứa từ 10 đến 11 chữ số"
    ),
  Email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự"),
});

type BankFormValues = z.infer<typeof bankSchema>;

const BankManagementPage = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [banks, setBanks] = useState<any>(mockBanks);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: fetchedBanks, isLoading } = useGetAllBanksQuery();
  const createBankMutation = useCreateBankMutation();
  const updateBankMutation = useUpdateBankMutation();
  // Update banks state when fetchedBanks changes
  useEffect(() => {
    if (fetchedBanks) {
      setBanks(fetchedBanks);
    }
  }, [fetchedBanks]);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      MaNH: "",
      TenNH: "",
      DiaChi: "",
      Phone: "",
      Email: "",
    },
  });

  // Filter banks based on search term
  const filteredBanks = banks.filter(
    (bank) =>
      bank?.TenNH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank?.MaNH?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create new bank
  const onSubmit = async (values: BankFormValues) => {
    try {
      const newBank: Omit<Bank, "id"> = {
        MaNH: values.MaNH,
        TenNH: values.TenNH,
        DiaChi: values.DiaChi,
        Phone: values.Phone,
        Email: values.Email,
      };

      await createBankMutation.mutateAsync(newBank, {
        onSuccess: () => {
          toast({
            title: "Thêm ngân hàng thành công",
            description: `Đã thêm ngân hàng ${values.TenNH}`,
          });
          setOpenDialog(false);
          form.reset();
        },
        onError: () => {
          toast({
            title: "Lỗi thêm ngân hàng",
            description: "Đã xảy ra lỗi khi thêm ngân hàng mới",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  // Delete bank
  const handleDelete = (bankId: string) => {
    try {
      const updatedBanks = banks.filter((bank) => bank.MaNH !== bankId);
      setBanks(updatedBanks);

      toast({
        title: "Xóa ngân hàng thành công",
        description: "Ngân hàng đã được xóa khỏi hệ thống",
      });
    } catch (error) {
      toast({
        title: "Lỗi xóa ngân hàng",
        description: "Đã xảy ra lỗi khi xóa ngân hàng",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Edit bank
  const handleEditBank = (bank: Bank) => {
    setSelectedBank(bank);
    setEditDialogOpen(true);
  };

  // Save edited bank
  const handleSaveBank = async (bankData: Omit<Bank, "id">) => {
    if (!selectedBank) return;

    try {
      await updateBankMutation.mutateAsync(
        { maNH: selectedBank.MaNH, bankData },
        {
          onSuccess: () => {
            const updatedBanks = banks.map((bank) =>
              bank.MaNH === selectedBank.MaNH ? { ...bank, ...bankData } : bank
            );

            setBanks(updatedBanks);

            toast({
              title: "Cập nhật thành công",
              description: `Đã cập nhật thông tin cho ngân hàng ${bankData.TenNH}`,
            });

            setEditDialogOpen(false);
          },
          onError: () => {
            toast({
              title: "Lỗi cập nhật",
              description: "Đã xảy ra lỗi khi cập nhật thông tin ngân hàng",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: "Lỗi không xác định",
        description: "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý ngân hàng</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm ngân hàng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm ngân hàng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để thêm ngân hàng mới vào hệ thống
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="MaNH"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã ngân hàng</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã ngân hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="TenNH"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên ngân hàng</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên ngân hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="DiaChi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập địa chỉ ngân hàng"
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

                <DialogFooter>
                  <Button type="submit">Thêm ngân hàng</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ngân hàng</CardTitle>
          <CardDescription>
            Quản lý thông tin ngân hàng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm ngân hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NH</TableHead>
                  <TableHead>Tên ngân hàng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanks.length > 0 ? (
                  filteredBanks.map((bank) => (
                    <TableRow key={bank.MaNH}>
                      <TableCell className="font-medium">{bank.MaNH}</TableCell>
                      <TableCell>{bank.TenNH}</TableCell>
                      <TableCell>{bank.DiaChi}</TableCell>
                      <TableCell>{bank.Phone}</TableCell>
                      <TableCell>{bank.Email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBank(bank)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Xóa
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Xác nhận xóa ngân hàng
                                </DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn xóa ngân hàng{" "}
                                  {bank.TenNH}? Hành động này không thể hoàn
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
                                  onClick={() => handleDelete(bank.MaNH)}
                                >
                                  Xóa ngân hàng
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {searchTerm
                        ? "Không tìm thấy ngân hàng phù hợp"
                        : "Chưa có ngân hàng nào trong hệ thống"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <BankEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        bank={selectedBank}
        onSave={handleSaveBank}
      />
    </div>
  );
};

export default BankManagementPage;
