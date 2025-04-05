
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockBankAccounts, mockUsers, mockMoneyTransactions } from "@/utils/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MoneyTransaction } from "@/utils/types";
import { Plus, MinusCircle, PlusCircle, Search } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for fund transaction
const transactionSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn nhà đầu tư"),
  amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
  type: z.enum(["deposit", "withdraw"]),
  reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const FundManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      userId: "",
      amount: 0,
      type: "deposit",
      reason: "",
    },
  });

  // Get all investor users
  const investors = mockUsers.filter(user => user.role === "investor");

  // Filter based on search term
  const filteredAccounts = mockBankAccounts.filter(account => {
    const user = mockUsers.find(u => u.id === account.userId);
    if (!user) return false;
    
    return user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const onSubmit = (values: TransactionFormValues) => {
    try {
      // Find the account
      const account = mockBankAccounts.find(acc => acc.userId === values.userId);
      
      if (!account) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy tài khoản của nhà đầu tư",
          variant: "destructive",
        });
        return;
      }
      
      // Get the latest transaction for opening balance
      const lastTransaction = [...mockMoneyTransactions]
        .filter(t => t.userId === values.userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      const openingBalance = lastTransaction ? lastTransaction.closingBalance : account.balance;
      const transactionAmount = values.type === "deposit" ? values.amount : -values.amount;
      const closingBalance = openingBalance + transactionAmount;
      
      // Don't allow withdrawal if it would make balance negative
      if (closingBalance < 0) {
        toast({
          title: "Lỗi",
          description: "Số dư không đủ để thực hiện giao dịch này",
          variant: "destructive",
        });
        return;
      }
      
      // Create new transaction
      const newTransaction: MoneyTransaction = {
        id: mockMoneyTransactions.length + 1,
        userId: values.userId,
        date: new Date().toISOString().split('T')[0],
        openingBalance: openingBalance,
        amount: transactionAmount,
        reason: values.reason,
        closingBalance: closingBalance
      };
      
      mockMoneyTransactions.push(newTransaction);
      
      // Update account balance
      account.balance = closingBalance;
      
      setShowAddDialog(false);
      form.reset();
      
      toast({
        title: "Giao dịch thành công",
        description: `Đã ${values.type === "deposit" ? "nạp" : "rút"} ${values.amount.toLocaleString()} VNĐ ${values.type === "deposit" ? "vào" : "từ"} tài khoản`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện giao dịch. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý tiền nhà đầu tư</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tài khoản nhà đầu tư</CardTitle>
          <CardDescription>
            Quản lý giao dịch tiền của nhà đầu tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative max-w-md w-full">
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
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm giao dịch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm giao dịch tiền</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhà đầu tư</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn nhà đầu tư" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {investors.map((investor) => (
                                <SelectItem key={investor.id} value={investor.id}>
                                  {investor.fullName} ({investor.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại giao dịch</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại giao dịch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="deposit">Nạp tiền</SelectItem>
                              <SelectItem value="withdraw">Rút tiền</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số tiền (VNĐ)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lý do</FormLabel>
                          <FormControl>
                            <Input placeholder="Nạp tiền vào tài khoản" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Thực hiện giao dịch</Button>
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
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead className="text-right">Số dư (VNĐ)</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const user = mockUsers.find(u => u.id === account.userId);
                    const bank = account.bankId === "NH001" ? "VietcomBank" : "Techcombank";
                    
                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.userId}</TableCell>
                        <TableCell>{user?.fullName || "N/A"}</TableCell>
                        <TableCell>{bank}</TableCell>
                        <TableCell className="text-right font-semibold">{account.balance.toLocaleString()} VNĐ</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              onClick={() => {
                                form.reset({
                                  userId: account.userId,
                                  amount: 0,
                                  type: "deposit",
                                  reason: "Nạp tiền vào tài khoản"
                                });
                                setShowAddDialog(true);
                              }}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => {
                                form.reset({
                                  userId: account.userId,
                                  amount: 0,
                                  type: "withdraw",
                                  reason: "Rút tiền từ tài khoản"
                                });
                                setShowAddDialog(true);
                              }}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "Không tìm thấy nhà đầu tư phù hợp" : "Chưa có tài khoản nhà đầu tư nào trong hệ thống"}
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

export default FundManagementPage;
