import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stock } from "@/utils/types";
import { ArrowDown, ArrowUp, Pencil, Trash, PackagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Input } from "@/components/ui/input";
const STATUS_LABELS = {
  0: "Chưa niêm yết",
  1: "Đang giao dịch",
  2: "Ngừng giao dịch",
};

interface StockTableProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
  // onList: (stock: Stock) => void;
  onHalt: (stock: Stock) => void;
  onResume: (stock: Stock) => void;
  handleNavigateAllocation: (stock: Stock) => void;
}

export function StockTable({
  stocks,
  onEdit,
  onDelete,
  // onList,
  onHalt,
  onResume,
  handleNavigateAllocation,
}: StockTableProps) {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [stockToResume, setStockToResume] = useState<Stock | null>(null);
  const [referencePrice, setReferencePrice] = useState<number | null>(null);

  const handleOpenResumeDialog = (stock: Stock) => {
    setStockToResume(stock);
    setReferencePrice(null); // Reset giá tham chiếu khi mở dialog
    setIsResumeDialogOpen(true);
  };

  const handleConfirmResume = () => {
    if (stockToResume && referencePrice !== null) {
      onResume({ ...stockToResume, GiaTC: referencePrice });
      setIsResumeDialogOpen(false);
      setStockToResume(null);
      setReferencePrice(null);
      console.log("Mở giao dịch cho cổ phiếu:", {
        ...stockToResume,
        GiaTC: referencePrice,
      });
    } else {
      alert("Vui lòng nhập giá tham chiếu hợp lệ!");
    }
  };
  const StatusBadge = ({ status }: { status: number }) => {
    const colors = {
      0: "bg-yellow-100 text-yellow-800 border-yellow-200",
      1: "bg-green-100 text-green-800 border-green-200",
      2: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-medium border",
          colors[status as keyof typeof colors]
        )}
      >
        {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
      </span>
    );
  };

  const canDeleteStock = (stock: Stock) => stock.Status === 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã CP</TableHead>
            <TableHead className="w-[20%]">Tên công ty</TableHead>
            <TableHead className="w-[15%]">Trạng thái</TableHead>
            <TableHead className="text-right">Giá tham chiếu</TableHead>
            <TableHead className="text-right">Giá trần</TableHead>
            <TableHead className="text-right">Giá sàn</TableHead>
            <TableHead className="text-right">Tổng khối lượng</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.length > 0 ? (
            stocks.map((stock) => (
              <TableRow key={stock.MaCP}>
                <TableCell className="font-medium">{stock.MaCP}</TableCell>
                <TableCell>{stock.TenCty}</TableCell>
                <TableCell>
                  <StatusBadge status={stock.Status} />
                </TableCell>
                <TableCell className="text-right">
                  {stock?.Status > 0
                    ? `${stock?.GiaTC?.toLocaleString()} VNĐ`
                    : "-"}
                </TableCell>
                <TableCell className="text-right text-stock-up">
                  {stock.Status > 0
                    ? `${stock?.GiaTran?.toLocaleString()} VNĐ`
                    : "-"}
                </TableCell>
                <TableCell className="text-right text-stock-down">
                  {stock.Status > 0
                    ? `${stock?.GiaSan?.toLocaleString()} VNĐ`
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {stock?.SoLuongPH?.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    {/* Nút Phân bổ cổ phiếu */}
                    {stock.Status === 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleNavigateAllocation(stock)}
                            >
                              <PackagePlus className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Phân bổ cổ phiếu</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Nút Ngừng giao dịch */}
                    {stock.Status === 1 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onHalt(stock)}
                            >
                              <ArrowDown className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ngừng giao dịch</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Nút Mở giao dịch */}
                    {stock.Status === 2 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenResumeDialog(stock)}
                            >
                              <ArrowUp className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mở giao dịch</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Nút Sửa cổ phiếu */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(stock)}
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sửa cổ phiếu</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Nút Xóa cổ phiếu */}
                    {canDeleteStock(stock) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onDelete(stock)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xóa cổ phiếu</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-6 text-muted-foreground"
              >
                Không tìm thấy cổ phiếu phù hợp
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Dialog thông báo mở giao dịch */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận mở giao dịch</DialogTitle>
          </DialogHeader>
          <p className="text-red-600 font-semibold">
            Bạn có chắc chắn muốn mở giao dịch cho cổ phiếu{" "}
            <span className="font-bold">{stockToResume?.MaCP}</span>? Hành động
            này sẽ cho phép cổ phiếu tiếp tục giao dịch trên sàn.
          </p>
          <div className="mt-4">
            <label
              htmlFor="referencePrice"
              className="block text-sm font-medium mb-4"
            >
              Giá tham chiếu
            </label>
            <Input
              id="referencePrice"
              type="number"
              placeholder="Nhập giá tham chiếu"
              value={referencePrice || ""}
              onChange={(e) =>
                setReferencePrice(
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResumeDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmResume}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
