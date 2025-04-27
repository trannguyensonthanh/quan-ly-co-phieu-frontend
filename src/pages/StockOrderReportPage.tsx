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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockOrders,
  mockStocks,
  mockTransactions,
  getStockOrders,
} from "@/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useGetAllStocksQuery,
  useGetStockOrdersQuery,
} from "@/queries/stock.queries";

const StockOrderReportPage = () => {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const { data: allStocks, isLoading: isStocksLoading } =
    useGetAllStocksQuery();
  const { data: stockOrdersData, isLoading: isOrdersLoading } =
    useGetStockOrdersQuery(
      selectedStock || undefined,
      fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      toDate ? format(toDate, "yyyy-MM-dd") : undefined
    );

  console.log("Stock Orders Data:", stockOrdersData); // Kiểm tra dữ liệu lệnh đặt

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
                  <label htmlFor="stockCode" className="text-sm font-medium">
                    Mã cổ phiếu
                  </label>
                  <Select
                    value={selectedStock}
                    onValueChange={setSelectedStock}
                  >
                    <SelectTrigger id="stockCode">
                      <SelectValue placeholder="Chọn mã CP" />
                    </SelectTrigger>
                    <SelectContent>
                      {allStocks?.map((stock) => (
                        <SelectItem key={stock.MaCP} value={stock.MaCP}>
                          {stock.MaCP} - {stock.TenCty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                {stockOrdersData?.map((order) => {
                  return (
                    <TableRow key={order.MaGD}>
                      <TableCell>
                        {new Date(order.NgayGD).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.LoaiGD === "M" ? "default" : "secondary"
                          }
                        >
                          {order.LoaiGD === "M" ? "Mua" : "Bán"}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.LoaiLenh}</TableCell>
                      <TableCell className="text-right">
                        {order?.SoLuongDat?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {order?.GiaDat
                          ? `${order.GiaDat.toLocaleString()} VNĐ`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.TongSoLuongKhop.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.GiaKhopTrungBinh
                          ? `${order.GiaKhopTrungBinh.toLocaleString()} VNĐ`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.TrangThai === "Hết"
                              ? "success"
                              : order.TrangThai === "Một phần"
                              ? "warning"
                              : order.TrangThai === "Chưa"
                              ? "destructive"
                              : order.TrangThai === "Chờ"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {order.TrangThai}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {stockOrdersData?.length === 0 ||
                  (!stockOrdersData && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-6"
                      >
                        Không có lệnh đặt nào cho mã {selectedStock} trong
                        khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  ))}
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
