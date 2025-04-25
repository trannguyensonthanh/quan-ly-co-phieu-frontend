/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
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
import { getUserMoneyTransactions, mockUsers } from "@/utils/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetAllInvestorsQuery,
  useGetInvestorAccountCashStatementDetailQuery,
} from "@/queries/investor.queries";
import { useGetAccountCashStatementDetailQuery } from "@/queries/statement.queries";
import { useGetAllBankAccountsQuery } from "@/queries/adminBankAccount.queries";
import { toast } from "sonner";

const MoneyTransactionReportPage = () => {
  const { user, isEmployee } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any>(user?.username || "");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const investorQuery = useGetInvestorAccountCashStatementDetailQuery(
    selectedUser?.MaNDT,
    selectedUser?.MaTK,
    fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
    toDate ? format(toDate, "yyyy-MM-dd") : undefined
  );

  const accountQuery = useGetAccountCashStatementDetailQuery(
    selectedUser?.MaTK,
    fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
    toDate ? format(toDate, "yyyy-MM-dd") : undefined
  );

  const { data: allBankAccounts, isLoading: isLoadingBankAccounts } =
    useGetAllBankAccountsQuery();

  const {
    data: investorCashStatement,
    isLoading,
    error,
  } = isEmployee ? investorQuery : accountQuery;

  if (error) {
    toast.error(`Đã xảy ra lỗi: ${error.message}`);
    return null;
  }
  const resetFilter = () => {
    if (isEmployee) {
      setSelectedUser("");
    }
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sao kê giao dịch tiền</h1>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo giao dịch tiền</CardTitle>
          <CardDescription>
            Xem các giao dịch tiền của nhà đầu tư trong khoảng thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                {isEmployee && (
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="userId" className="text-sm font-medium">
                      Nhà đầu tư
                    </label>
                    <Select
                      value={
                        selectedUser
                          ? `${selectedUser.MaNDT}-${selectedUser.MaTK}`
                          : ""
                      }
                      onValueChange={(value) => {
                        const [MaNDT, MaTK] = value.split("-");
                        const selected = allBankAccounts?.find(
                          (user) => user.MaNDT === MaNDT && user.MaTK === MaTK
                        );
                        setSelectedUser(
                          selected
                            ? { MaNDT: selected.MaNDT, MaTK: selected.MaTK }
                            : null
                        );
                      }}
                    >
                      <SelectTrigger id="userId">
                        <SelectValue placeholder="Chọn nhà đầu tư" />
                      </SelectTrigger>
                      <SelectContent>
                        {allBankAccounts?.map((user) => (
                          <SelectItem
                            key={user.MaTK}
                            value={`${user.MaNDT}-${user.MaTK}`}
                          >
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium truncate">
                                {user.TenNDT} - {user.MaNDT}| Mã TK: {user.MaTK}{" "}
                                - {user.MaNH}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="fromDate" className="text-sm font-medium">
                    Từ ngày
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate
                          ? format(fromDate, "dd/MM/yyyy")
                          : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="toDate" className="text-sm font-medium">
                    Đến ngày
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        disabled={(date) => !fromDate || date < fromDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={resetFilter}>
                Đặt lại
              </Button>
            </div>
          </div>

          {selectedUser ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Số dư đầu kỳ (VNĐ)</TableHead>
                  <TableHead>Số tiền phát sinh (VNĐ)</TableHead>
                  <TableHead>Số dư cuối kỳ (VNĐ)</TableHead>
                  <TableHead>Loại giao dịch</TableHead>
                  <TableHead>Mã cổ phiếu</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá (VNĐ)</TableHead>
                  <TableHead>Mã giao dịch</TableHead>
                  <TableHead>Mã lệnh khớp</TableHead>
                  <TableHead>Mã giao dịch tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investorCashStatement?.map((transaction) => (
                  <TableRow key={transaction.MaGD}>
                    <TableCell>
                      {new Date(transaction.Ngay).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {transaction.SoDuDauKy_GD?.toLocaleString()} VNĐ
                    </TableCell>
                    <TableCell
                      style={{
                        color:
                          transaction?.SoTienPhatSinh > 0 ? "green" : "red",
                      }}
                    >
                      {transaction?.SoTienPhatSinh
                        ? transaction?.SoTienPhatSinh > 0
                          ? `+${transaction?.SoTienPhatSinh?.toLocaleString()} VNĐ`
                          : transaction?.SoTienPhatSinh?.toLocaleString() +
                            " VNĐ"
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {transaction.SoDuCuoiKy_GD?.toLocaleString()} VNĐ
                    </TableCell>
                    <TableCell>{transaction.LoaiGiaoDich}</TableCell>
                    <TableCell>{transaction.MaCP || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {transaction.SoLuong?.toLocaleString() || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.DonGia
                        ? transaction.DonGia.toLocaleString() + " VNĐ"
                        : "-"}
                    </TableCell>
                    <TableCell>{transaction.MaGD}</TableCell>
                    <TableCell>{transaction.MaLK || "-"}</TableCell>
                    <TableCell>{transaction.MaGDTien || "-"}</TableCell>
                  </TableRow>
                ))}
                {investorCashStatement?.length === 0 ||
                  (!investorCashStatement && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center text-muted-foreground py-6"
                      >
                        Không có giao dịch tiền nào trong khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {isEmployee
                ? "Vui lòng chọn nhà đầu tư để xem báo cáo"
                : "Không tìm thấy dữ liệu giao dịch"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MoneyTransactionReportPage;
