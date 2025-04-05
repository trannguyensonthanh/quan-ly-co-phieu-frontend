
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getUserMoneyTransactions, mockUsers } from "@/utils/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const MoneyTransactionReportPage = () => {
  const { user, isEmployee } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>(user?.id || "");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // Get money transactions based on selected user and date range
  const transactions = selectedUser 
    ? getUserMoneyTransactions(
        selectedUser,
        fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate ? format(toDate, "yyyy-MM-dd") : undefined
      )
    : [];

  // Sort by date (oldest first for better readability of balance changes)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

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
                    <label htmlFor="userId" className="text-sm font-medium">Nhà đầu tư</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger id="userId">
                        <SelectValue placeholder="Chọn nhà đầu tư" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.filter(u => u.role === 'investor').map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="fromDate" className="text-sm font-medium">Từ ngày</label>
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
                        {fromDate ? format(fromDate, "dd/MM/yyyy") : "Chọn ngày"}
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
                  <label htmlFor="toDate" className="text-sm font-medium">Đến ngày</label>
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
                        disabled={date => !fromDate || date < fromDate}
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
                  <TableHead className="text-right">Số dư đầu kỳ</TableHead>
                  <TableHead className="text-right">Số tiền phát sinh</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead className="text-right">Số dư cuối kỳ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">{transaction.openingBalance.toLocaleString()} VNĐ</TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.amount.toLocaleString()} VNĐ
                    </TableCell>
                    <TableCell>{transaction.reason}</TableCell>
                    <TableCell className="text-right">{transaction.closingBalance.toLocaleString()} VNĐ</TableCell>
                  </TableRow>
                ))}
                {sortedTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Không có giao dịch tiền nào trong khoảng thời gian này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {isEmployee ? "Vui lòng chọn nhà đầu tư để xem báo cáo" : "Không tìm thấy dữ liệu giao dịch"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MoneyTransactionReportPage;
