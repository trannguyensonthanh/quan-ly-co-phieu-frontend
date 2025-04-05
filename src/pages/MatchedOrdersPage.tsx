
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockOrders, mockTransactions } from "@/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MatchedOrdersPage = () => {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // Get user's accounts
  const userAccounts = user 
    ? { id: user.id } // Simplified for the mock data
    : null;
  
  // Get user's matched orders
  const userOrders = userAccounts
    ? mockOrders.filter(order => order.accountId.startsWith(userAccounts.id))
    : [];
  
  // Get only matched transactions
  const userTransactions = userOrders.flatMap(order => {
    const transactions = mockTransactions.filter(t => t.orderId === order.id);
    return transactions.map(t => ({
      ...t,
      order: order
    }));
  });
  
  // Apply date filter if set
  const filteredTransactions = userTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    
    if (fromDate && transactionDate < fromDate) {
      return false;
    }
    
    if (toDate) {
      // Set time to end of day for toDate
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (transactionDate > endOfDay) {
        return false;
      }
    }
    
    return true;
  });

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const resetFilter = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sao kê lệnh khớp</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử lệnh khớp</CardTitle>
          <CardDescription>
            Danh sách các lệnh khớp của bạn trong khoảng thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã LK</TableHead>
                <TableHead>Mã GD</TableHead>
                <TableHead>Ngày giờ khớp</TableHead>
                <TableHead>Loại GD</TableHead>
                <TableHead>Mã CP</TableHead>
                <TableHead className="text-right">Khối lượng khớp</TableHead>
                <TableHead className="text-right">Giá khớp</TableHead>
                <TableHead>Kiểu khớp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.orderId}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.order.type === 'M' ? "default" : "secondary"}>
                      {transaction.order.type === 'M' ? 'Mua' : 'Bán'}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.order.stockCode}</TableCell>
                  <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{transaction.price.toLocaleString()} VNĐ</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        transaction.matchType === 'Khớp hết' ? "success" : "warning"
                      }
                    >
                      {transaction.matchType}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {sortedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    Không có lệnh khớp nào trong khoảng thời gian này
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchedOrdersPage;
