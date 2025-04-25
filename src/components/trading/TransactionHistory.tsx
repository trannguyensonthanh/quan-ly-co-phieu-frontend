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
import { mockOrders, mockTransactions } from "@/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatOrderType,
  getOrderTypeColor,
  getStatusColor,
} from "@/utils/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetMyMatchedOrdersTodayQuery,
  useGetMyOrdersTodayQuery,
} from "@/queries/statement.queries";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const TransactionHistory = () => {
  const { data: ordersToday, isLoading: isLoadingOrders } =
    useGetMyOrdersTodayQuery();
  const { data: matchedOrdersToday, isLoading: isLoadingMatchedOrders } =
    useGetMyMatchedOrdersTodayQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  // Handle order cancellation

  const handleCancelConfirm = () => {
    if (!selectedOrderId) return;
    // Check if within trading hours (8:00 - 15:00)
    const now = new Date();
    const hour = now.getHours();

    if (hour < 8 || hour >= 15) {
      toast.error("Chỉ có thể hủy lệnh trong giờ giao dịch (8:00 - 15:00)");
      return;
    }

    const orderToCancel = ordersToday.find(
      (order) => order.MaGD === selectedOrderId
    );

    if (!orderToCancel) {
      toast.error("Không tìm thấy lệnh cần hủy");
      return;
    }

    if (!["Chờ", "Một phần"].includes(orderToCancel.TrangThai)) {
      toast.error("Chỉ có thể hủy lệnh ở trạng thái Chờ hoặc Một phần");
      return;
    }

    // Simulate API call
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: "Đang hủy lệnh...",
      success: "Hủy lệnh thành công",
      error: "Có lỗi xảy ra khi hủy lệnh",
    });
  };

  return (
    <>
      <Card>
        <Tabs defaultValue="orders">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lịch sử giao dịch ngày hôm nay</CardTitle>
              <TabsList>
                <TabsTrigger value="orders">Lệnh đặt</TabsTrigger>
                <TabsTrigger value="transactions">Lệnh khớp</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              Lịch sử giao dịch cổ phiếu của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="orders">
              {ordersToday?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã GD</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Mã CP</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Khối lượng
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Giá
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Phương thức
                      </TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersToday?.map((order) => (
                      <TableRow key={order.MaGD}>
                        <TableCell className="font-medium">
                          {order.MaGD}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(order.NgayGD.toString())}
                        </TableCell>
                        <TableCell className={getOrderTypeColor(order.LoaiGD)}>
                          {formatOrderType(order.LoaiGD)}
                        </TableCell>
                        <TableCell>{order.MaCP}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatNumber(order.SoLuongDat)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatCurrency(order.GiaDat)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {order.LoaiLenh}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(order.TrangThai)}
                          >
                            {order.TrangThai}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {["Chờ", "Một phần"].includes(order.TrangThai) && (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSelectedOrderId(order.MaGD);
                              }}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-6"
                  >
                    Không có dữ liệu lệnh đặt
                  </TableCell>
                </TableRow>
              )}
            </TabsContent>
            <TabsContent value="transactions">
              {matchedOrdersToday?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã khớp</TableHead>
                      <TableHead>Mã GD</TableHead>
                      <TableHead>Thời gian khớp</TableHead>
                      <TableHead>Khối lượng khớp</TableHead>
                      <TableHead>Giá khớp</TableHead>
                      <TableHead>Kiểu khớp</TableHead>
                      <TableHead>Loại GD</TableHead>
                      <TableHead>Mã CP</TableHead>
                      <TableHead>Mã TK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchedOrdersToday.map((transaction) => (
                      <TableRow key={transaction.MaLK}>
                        <TableCell className="font-medium">
                          {transaction.MaLK}
                        </TableCell>
                        <TableCell>{transaction.MaGD}</TableCell>
                        <TableCell>
                          {formatDateTime(transaction.NgayGioKhop.toString())}
                        </TableCell>
                        <TableCell>
                          {formatNumber(transaction.SoLuongKhop)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.GiaKhop)}
                        </TableCell>
                        <TableCell>{transaction.KieuKhop}</TableCell>
                        <TableCell>
                          {formatOrderType(transaction.LoaiGD)}
                        </TableCell>
                        <TableCell>{transaction.MaCP}</TableCell>
                        <TableCell>{transaction.MaTK}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-6"
                  >
                    Không có dữ liệu lệnh khớp
                  </TableCell>
                </TableRow>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      <AlertDialog
        open={!!selectedOrderId}
        onOpenChange={() => setSelectedOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              ⚠️ Cảnh báo hủy lệnh
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn hủy lệnh này không?</p>
              <p className="font-medium text-destructive">
                ❗ Cảnh báo: Hành động này sẽ:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Làm mất quyền ưu tiên khớp lệnh của bạn</li>
                <li>Không thể hoàn tác sau khi hủy</li>
                <li>
                  Có thể khiến bạn không mua/bán được ở mức giá tốt như hiện tại
                </li>
              </ul>
              <p className="text-sm italic mt-4">
                👉 Chúng tôi không chịu trách nhiệm cho mọi tổn thất sau khi hủy
                lệnh.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Tôi hiểu và vẫn muốn hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionHistory;
