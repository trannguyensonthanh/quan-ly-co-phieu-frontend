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
import { mockOrders, mockTransactions } from "@/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useGetMyMatchedStatementQuery } from "@/queries/statement.queries";

const MatchedOrdersPage = () => {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const { data: matchedStatement, isLoading } = useGetMyMatchedStatementQuery(
    fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
    toDate ? format(toDate, "yyyy-MM-dd") : undefined
  );

  // Sort by date (newest first)
  const sortedTransactions = matchedStatement?.sort((a, b) => {
    return (
      new Date(b.NgayGioKhop).getTime() - new Date(a.NgayGioKhop).getTime()
    );
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
                <TableHead>Mã LK</TableHead>
                <TableHead>Mã GD</TableHead>
                <TableHead>Ngày giờ khớp</TableHead>
                <TableHead>Loại GD</TableHead>
                <TableHead>Mã CP</TableHead>
                <TableHead className="text-right">Khối lượng khớp</TableHead>
                <TableHead className="text-right">Giá khớp</TableHead>
                <TableHead>Kiểu khớp</TableHead>
                <TableHead>Mã TK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions?.map((transaction) => (
                <TableRow key={transaction.MaLK}>
                  <TableCell className="font-medium">
                    {transaction.MaLK}
                  </TableCell>
                  <TableCell>{transaction.MaGD}</TableCell>
                  <TableCell>
                    {new Date(transaction.NgayGioKhop).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.LoaiGD === "M" ? "default" : "secondary"
                      }
                    >
                      {transaction.LoaiGD === "M" ? "Mua" : "Bán"}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.MaCP}</TableCell>
                  <TableCell className="text-right">
                    {transaction.SoLuongKhop.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.GiaKhop.toLocaleString()} VNĐ
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.KieuKhop === "Khớp hết"
                          ? "success"
                          : "warning"
                      }
                    >
                      {transaction.KieuKhop}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.MaTK}</TableCell>
                </TableRow>
              ))}
              {sortedTransactions?.length === 0 ||
                (!sortedTransactions && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-6"
                    >
                      Không có lệnh khớp nào trong khoảng thời gian này
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

export default MatchedOrdersPage;
