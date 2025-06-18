/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  mockBankAccounts,
  mockUsers,
  mockMoneyTransactions,
} from '@/utils/mock-data';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MoneyTransaction, User, BankAccount, Bank } from '@/utils/types';
import {
  Plus,
  MinusCircle,
  PlusCircle,
  Search,
  Building,
  Trash,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCreateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetAllBankAccountsQuery,
} from '@/queries/adminBankAccount.queries';
import {
  useDepositToInvestorAccountMutation,
  useGetAllInvestorsQuery,
  useWithdrawFromInvestorAccountMutation,
} from '@/queries/investor.queries';
import { useGetAllBanksQuery } from '@/queries/bank.queries';
import { cn } from '@/lib/utils';
import { useGetAllCashTransactionsQuery } from '@/queries/admin.queries';
const bankAccountSchema = z.object({
  username: z.string().min(1, 'Vui lòng chọn nhà đầu tư'),
  MaNH: z.string().min(1, 'Vui lòng chọn ngân hàng'),
  SoTien: z.coerce.number().min(0, 'Số dư không được âm'),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

const transactionSchema = z.object({
  maTK: z.string().min(1, 'Vui lòng chọn tài khoản'),
  soTien: z.coerce.number().min(1, 'Số tiền phải lớn hơn 0'),
  type: z.enum(['deposit', 'withdraw']),
  ghiChu: z.string().min(5, 'Lý do phải có ít nhất 5 ký tự'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const FundManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any>(mockBankAccounts);
  const [activeTab, setActiveTab] = useState('accounts');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [transactionType, setTransactionType] = useState<string>('all');
  const [transactionSearch, setTransactionSearch] = useState('');

  const { data: allBankAccounts, isLoading: isLoadingBankAccounts } =
    useGetAllBankAccountsQuery();

  const { data: allInvestors, isLoading: isLoadingInvestors } =
    useGetAllInvestorsQuery();

  const { data: allBanks, isLoading: isLoadingBanks } = useGetAllBanksQuery();

  const { data: allCashTransactions, isLoading: isLoadingCashTransactions } =
    useGetAllCashTransactionsQuery(
      startDate ? startDate.toISOString().split('T')[0] : '1900-01-01',
      endDate ? endDate.toISOString().split('T')[0] : '2100-12-31'
    );

  const deleteBankAccountMutation = useDeleteBankAccountMutation();

  const createBankAccountMutation = useCreateBankAccountMutation();
  const depositToInvestorAccountMutation =
    useDepositToInvestorAccountMutation();
  const withdrawFromInvestorAccountMutation =
    useWithdrawFromInvestorAccountMutation();
  useEffect(() => {
    if (allBankAccounts) {
      setBankAccounts(allBankAccounts);
    }
  }, [allBankAccounts]);

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      maTK: '',
      soTien: 0,
      type: 'deposit',
      ghiChu: '',
    },
  });

  const accountForm = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      username: '',
      MaNH: '',
      SoTien: 0,
    },
  });

  const handleCreateAccount = async (values: BankAccountFormValues) => {
    try {
      const newAccount = {
        MaTK: `TK${String(bankAccounts.length + 1).padStart(3, '0')}`,
        MaNDT: values.username, // Ensure MaNDT is included
        MaNH: values.MaNH,
        SoTien: values.SoTien,
      };

      await createBankAccountMutation.mutateAsync(newAccount, {
        onSuccess: () => {
          setBankAccounts([...bankAccounts, newAccount]);

          if (values.SoTien > 0) {
            const newTransaction: MoneyTransaction = {
              id: mockMoneyTransactions.length + 1,
              userId: values.username,
              date: new Date().toISOString().split('T')[0],
              openingBalance: 0,
              amount: values.SoTien,
              reason: 'Số dư ban đầu khi tạo tài khoản',
              closingBalance: values.SoTien,
            };

            mockMoneyTransactions.push(newTransaction);
          }

          setShowNewAccountDialog(false);
          accountForm.reset();

          toast({
            title: 'Tạo tài khoản thành công',
            description: `Đã tạo tài khoản ngân hàng mới với số dư ${values?.SoTien?.toLocaleString()} VNĐ`,
          });
        },
        onError: () => {
          toast({
            title: 'Lỗi',
            description: 'Không thể tạo tài khoản. Vui lòng thử lại.',
            variant: 'destructive',
          });
        },
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo tài khoản. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const handleTransaction = async (values: TransactionFormValues) => {
    try {
      const account = bankAccounts.find((acc) => acc.MaTK === values.maTK);
      if (!account) {
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy tài khoản. Vui lòng thử lại.',
          variant: 'destructive',
        });
        return;
      }

      const transactionAmount =
        values.type === 'deposit' ? values.soTien : -values.soTien;

      const closingBalance = account.SoTien + transactionAmount;

      if (closingBalance < 0) {
        toast({
          title: 'Lỗi',
          description: 'Số dư không đủ để thực hiện giao dịch.',
          variant: 'destructive',
        });
        return;
      }

      const mutation =
        values.type === 'deposit'
          ? depositToInvestorAccountMutation
          : withdrawFromInvestorAccountMutation;
      await mutation.mutateAsync(
        {
          maNDT: account.MaNDT,
          maTK: values.maTK,
          soTien: values.soTien,
          ghiChu: values.ghiChu,
        },
        {
          onSuccess: () => {
            const updatedAccounts = bankAccounts.map((acc) =>
              acc.MaTK === values.maTK
                ? { ...acc, SoTien: closingBalance }
                : acc
            );

            setBankAccounts(updatedAccounts);

            const newTransaction: MoneyTransaction = {
              id: mockMoneyTransactions.length + 1,
              userId: account.MaNDT,
              date: new Date().toISOString().split('T')[0],
              openingBalance: account.SoTien,
              amount: transactionAmount,
              reason: values.ghiChu,
              closingBalance: closingBalance,
            };

            mockMoneyTransactions.push(newTransaction);

            setShowAddDialog(false);
            transactionForm.reset();

            toast({
              title: 'Giao dịch thành công',
              description: `Đã ${
                values.type === 'deposit' ? 'nạp' : 'rút'
              } ${values.soTien.toLocaleString()} VNĐ ${
                values.type === 'deposit' ? 'vào' : 'từ'
              } tài khoản`,
            });
          },
          onError: () => {
            toast({
              title: 'Lỗi',
              description: 'Không thể thực hiện giao dịch. Vui lòng thử lại.',
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện giao dịch. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteBankAccountMutation.mutateAsync(
        { maTK: accountId },
        {
          onSuccess: () => {
            const updatedAccounts = bankAccounts.filter(
              (acc) => acc.MaTK !== accountId
            );
            setBankAccounts(updatedAccounts);

            toast({
              title: 'Xóa tài khoản thành công',
              description: 'Tài khoản đã được xóa khỏi hệ thống',
            });
          },
          onError: () => {
            toast({
              title: 'Lỗi',
              description: 'Không thể xóa tài khoản. Vui lòng thử lại.',
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài khoản. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const filteredTransactions =
    allCashTransactions
      ?.filter((transaction) => {
        console.log('transaction', transaction);
        // Filter by transaction type
        if (transactionType !== 'all') {
          const isDeposit = transaction.LoaiGDTien === 'Nạp tiền';
          if (
            (transactionType === 'deposit' && !isDeposit) ||
            (transactionType === 'withdraw' && isDeposit)
          ) {
            return false;
          }
        }

        // Filter by search term
        const user = allInvestors?.find((u) => u.MaNDT === transaction.MaNDT);
        const searchString = `${user?.HoTen || ''} ${
          transaction.GhiChu || ''
        }`.toLowerCase();
        if (
          transactionSearch &&
          !searchString.includes(transactionSearch.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      ?.sort(
        (a, b) => new Date(b.NgayGD).getTime() - new Date(a.NgayGD).getTime()
      ) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý tài khoản ngân hàng</h1>

      <Tabs
        defaultValue="accounts"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Tài khoản ngân hàng</TabsTrigger>
          <TabsTrigger value="transactions">Lịch sử giao dịch</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản ngân hàng nhà đầu tư</CardTitle>
              <CardDescription>
                Quản lý tài khoản ngân hàng và số dư của nhà đầu tư
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tài khoản..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Dialog
                    open={showNewAccountDialog}
                    onOpenChange={setShowNewAccountDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Building className="mr-2 h-4 w-4" />
                        Tạo tài khoản mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Tạo tài khoản ngân hàng mới</DialogTitle>
                      </DialogHeader>

                      <Form {...accountForm}>
                        <form
                          onSubmit={accountForm.handleSubmit(
                            handleCreateAccount
                          )}
                          className="space-y-4"
                        >
                          <FormField
                            control={accountForm.control}
                            name="username"
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
                                    {allInvestors?.map((investor) => (
                                      <SelectItem
                                        key={investor.MaNDT}
                                        value={investor.MaNDT}
                                      >
                                        {investor.HoTen} ({investor.MaNDT})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={accountForm.control}
                            name="MaNH"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ngân hàng</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn ngân hàng" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {allBanks.map((bank) => (
                                      <SelectItem
                                        key={bank.MaNH}
                                        value={bank.MaNH}
                                      >
                                        {bank.TenNH}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={accountForm.control}
                            name="SoTien"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số dư ban đầu (VNĐ)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button type="submit">Tạo tài khoản</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm giao dịch
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Thêm giao dịch tiền</DialogTitle>
                      </DialogHeader>

                      <Form {...transactionForm}>
                        <form
                          onSubmit={transactionForm.handleSubmit(
                            handleTransaction
                          )}
                          className="space-y-4"
                        >
                          <FormField
                            control={transactionForm.control}
                            name="maTK"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tài khoản</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn tài khoản" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {bankAccounts.map((account) => (
                                      <SelectItem
                                        key={account.MaTK}
                                        value={account.MaTK}
                                      >
                                        {account.MaNDT} - {account.TenNDT} (
                                        {account.MaTK})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={transactionForm.control}
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
                                    <SelectItem value="deposit">
                                      Nạp tiền
                                    </SelectItem>
                                    <SelectItem value="withdraw">
                                      Rút tiền
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={transactionForm.control}
                            name="soTien"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số tiền (VNĐ)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={transactionForm.control}
                            name="ghiChu"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lý do</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nạp tiền vào tài khoản"
                                    {...field}
                                  />
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
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã TK</TableHead>
                      <TableHead>Nhà đầu tư</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Ngân hàng</TableHead>
                      <TableHead className="text-right">Số dư (VNĐ)</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts?.length > 0 ? (
                      bankAccounts?.map((account) => (
                        <TableRow key={account?.MaTK}>
                          <TableCell className="font-medium">
                            {account.MaTK}
                          </TableCell>
                          <TableCell>{account.MaNDT}</TableCell>
                          <TableCell>{account.TenNDT}</TableCell>
                          <TableCell>{account.MaNH}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {account?.SoTien?.toLocaleString()} VNĐ
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={() => {
                                  transactionForm.reset({
                                    maTK: account.MaTK,
                                    soTien: 0,
                                    type: 'deposit',
                                    ghiChu: 'Nạp tiền vào tài khoản',
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
                                  transactionForm.reset({
                                    maTK: account.MaTK,
                                    soTien: 0,
                                    type: 'withdraw',
                                    ghiChu: 'Rút tiền từ tài khoản',
                                  });
                                  setShowAddDialog(true);
                                }}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <Dialog
                                open={account.showDeleteDialog}
                                onOpenChange={(isOpen) => {
                                  setBankAccounts((prevAccounts) =>
                                    prevAccounts.map((acc) =>
                                      acc.MaTK === account.MaTK
                                        ? { ...acc, showDeleteDialog: isOpen }
                                        : acc
                                    )
                                  );
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Xác nhận xóa tài khoản
                                    </DialogTitle>
                                  </DialogHeader>
                                  <p>
                                    Bạn có chắc chắn muốn xóa tài khoản{' '}
                                    {account.MaTK} của {account.MaNDT}?
                                  </p>
                                  <DialogFooter className="mt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setBankAccounts((prevAccounts) =>
                                          prevAccounts.map((acc) =>
                                            acc.MaTK === account.MaTK
                                              ? {
                                                  ...acc,
                                                  showDeleteDialog: false,
                                                }
                                              : acc
                                          )
                                        );
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        handleDeleteAccount(account.MaTK);
                                        setBankAccounts((prevAccounts) =>
                                          prevAccounts.map((acc) =>
                                            acc.MaTK === account.MaTK
                                              ? {
                                                  ...acc,
                                                  showDeleteDialog: false,
                                                }
                                              : acc
                                          )
                                        );
                                      }}
                                    >
                                      Xóa tài khoản
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
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          {searchTerm
                            ? 'Không tìm thấy tài khoản phù hợp'
                            : 'Chưa có tài khoản ngân hàng nào trong hệ thống'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử giao dịch tiền</CardTitle>
              <CardDescription>
                Xem lịch sử các giao dịch nạp và rút tiền
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div>
                      <div>Từ ngày</div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground'
                            )}
                          >
                            {startDate ? (
                              format(startDate, 'dd/MM/yyyy')
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <div>Đến ngày</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !endDate && 'text-muted-foreground'
                          )}
                        >
                          {endDate ? (
                            format(endDate, 'dd/MM/yyyy')
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <div>Loại giao dịch</div>
                    <Select
                      value={transactionType}
                      onValueChange={setTransactionType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại giao dịch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="deposit">Nạp tiền</SelectItem>
                        <SelectItem value="withdraw">Rút tiền</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div>Tìm kiếm</div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm giao dịch..."
                        value={transactionSearch}
                        onChange={(e) => setTransactionSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Ngày giao dịch</TableHead>
                      <TableHead>Nhà đầu tư</TableHead>
                      <TableHead>Số dư ban đầu</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Số dư sau</TableHead>
                      <TableHead>Lý do</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.MaGDTien}>
                          <TableCell className="font-medium">
                            {transaction.MaGDTien}
                          </TableCell>
                          <TableCell>{transaction.NgayGD}</TableCell>
                          <TableCell>{transaction.MaNDT}</TableCell>
                          <TableCell>
                            {transaction.LoaiGDTien === 'Nạp tiền'
                              ? (
                                  transaction.SoDu - transaction.SoTien
                                ).toLocaleString()
                              : (
                                  transaction.SoDu + transaction.SoTien
                                ).toLocaleString()}{' '}
                            VNĐ
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transaction.LoaiGDTien === 'Nạp tiền'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {transaction.LoaiGDTien === 'Nạp tiền'
                                ? '+'
                                : '-'}
                              {transaction.SoTien.toLocaleString()} VNĐ
                            </span>
                          </TableCell>
                          <TableCell>
                            {transaction.LoaiGDTien === 'Nạp tiền'
                              ? transaction.SoDu.toLocaleString()
                              : transaction.SoDu.toLocaleString()}{' '}
                            VNĐ
                          </TableCell>
                          <TableCell>{transaction.GhiChu}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Không tìm thấy giao dịch nào phù hợp
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundManagementPage;
