import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stock } from "@/utils/types";
import { ArrowDown, ArrowUp, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  0: "Chưa niêm yết",
  1: "Đang giao dịch",
  2: "Ngừng giao dịch",
};

interface StockTableProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
  onList: (stock: Stock) => void;
  onHalt: (stock: Stock) => void;
  onResume: (stock: Stock) => void;
}

export function StockTable({
  stocks,
  onEdit,
  onDelete,
  onList,
  onHalt,
  onResume,
}: StockTableProps) {
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
                    {stock.Status === 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onList(stock)}
                        title="Niêm yết"
                      >
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      </Button>
                    )}

                    {stock.Status === 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onHalt(stock)}
                        title="Ngừng giao dịch"
                      >
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      </Button>
                    )}

                    {stock.Status === 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onResume(stock)}
                        title="Mở giao dịch"
                      >
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(stock)}
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>

                    {canDeleteStock(stock) && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(stock)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
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
    </div>
  );
}
