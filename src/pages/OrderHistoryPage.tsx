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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  mockBankAccounts,
  mockOrders,
  mockTransactions,
  getUserOrders,
} from "@/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon, SearchIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useGetMyOrderStatementQuery } from "@/queries/statement.queries";

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const { data: orderStatement, isLoading } = useGetMyOrderStatementQuery(
    fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
    toDate ? format(toDate, "yyyy-MM-dd") : undefined
  );
  // Get user's orders

  // Sort by date (newest first)
  const sortedOrders = orderStatement?.sort((a, b) => {
    return new Date(b.NgayGD).getTime() - new Date(a.NgayGD).getTime();
  });

  console.log("sortedOrders", sortedOrders);
  const resetFilter = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sao kê giao dịch lệnh</h1>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch lệnh</CardTitle>
          <CardDescription>
            Danh sách các lệnh đặt của bạn trong khoảng thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Ngày GD</TableHead>
                <TableHead>Loại GD</TableHead>
                <TableHead>Loại Lệnh</TableHead>
                <TableHead>Mã CP</TableHead>
                <TableHead className="text-right">Khối lượng đặt</TableHead>
                <TableHead className="text-right">Giá đặt</TableHead>
                <TableHead className="text-right">Tổng khớp</TableHead>
                <TableHead className="text-right">Giá khớp TB</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders?.map((order) => (
                <TableRow key={order.MaGD}>
                  <TableCell className="font-medium">{order.MaGD}</TableCell>
                  <TableCell>
                    {new Date(order?.NgayGD).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.LoaiGD === "M" ? "default" : "secondary"}
                    >
                      {order.LoaiGD === "M" ? "Mua" : "Bán"}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.LoaiLenh}</TableCell>
                  <TableCell>{order.MaCP}</TableCell>
                  <TableCell className="text-right">
                    {order.SoLuongDat?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.LoaiGD === "M"
                      ? "-"
                      : `${order.GiaDat?.toLocaleString()} VNĐ`}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.TongSoLuongKhop?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.GiaKhopTrungBinh
                      ? order.GiaKhopTrungBinh?.toLocaleString()
                      : "0"}{" "}
                    VNĐ
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
              ))}
              {sortedOrders?.length === 0 ||
                (!sortedOrders && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-6"
                    >
                      Không có giao dịch nào trong khoảng thời gian này
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistoryPage;
