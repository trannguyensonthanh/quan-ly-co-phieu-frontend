
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockOrders, mockStocks, mockTransactions, getStockOrders } from "@/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const StockOrderReportPage = () => {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // Get stock orders based on selected stock and date range
  const stockOrders = selectedStock 
    ? getStockOrders(
        selectedStock,
        fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate ? format(toDate, "yyyy-MM-dd") : undefined
      )
    : [];

  // Sort by date (newest first)
  const sortedOrders = [...stockOrders].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const resetFilter = () => {
    setSelectedStock("");
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sao kê lệnh đặt</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lệnh đặt theo mã cổ phiếu</CardTitle>
          <CardDescription>
            Xem tất cả các lệnh đặt của một mã cổ phiếu trong khoảng thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="stockCode" className="text-sm font-medium">Mã cổ phiếu</label>
                  <Select value={selectedStock} onValueChange={setSelectedStock}>
                    <SelectTrigger id="stockCode">
                      <SelectValue placeholder="Chọn mã CP" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStocks.map(stock => (
                        <SelectItem key={stock.code} value={stock.code}>
                          {stock.code} - {stock.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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

          {selectedStock ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày GD</TableHead>
                  <TableHead>Loại GD</TableHead>
                  <TableHead>Loại lệnh</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Giá đặt</TableHead>
                  <TableHead className="text-right">Số lượng khớp</TableHead>
                  <TableHead className="text-right">Giá khớp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => {
                  const lastTransaction = order.transactions && order.transactions.length > 0
                    ? order.transactions.reduce((latest, current) => {
                        return new Date(latest.date).getTime() > new Date(current.date).getTime() ? latest : current;
                      })
                    : null;
                    
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{new Date(order.date).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant={order.type === 'M' ? "default" : "secondary"}>
                          {order.type === 'M' ? 'Mua' : 'Bán'}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.method}</TableCell>
                      <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{order.price.toLocaleString()} VNĐ</TableCell>
                      <TableCell className="text-right">{order.matchedQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {lastTransaction ? `${lastTransaction.price.toLocaleString()} VNĐ` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            order.status === 'Hết' ? "success" :
                            order.status === 'Một phần' ? "warning" :
                            order.status === 'Chưa' ? "destructive" :
                            order.status === 'Chờ' ? "outline" :
                            "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                      Không có lệnh đặt nào cho mã {selectedStock} trong khoảng thời gian này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Vui lòng chọn mã cổ phiếu để xem báo cáo
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOrderReportPage;
