import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Stock } from "@/utils/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  stocks: Stock[];
}

const DetailedPriceBoardModal = ({ stocks }: Props) => {
  const theme = localStorage.getItem("vite-ui-theme") || "light";
  const getPriceColor = (
    currentPrice: number,
    referencePrice: number,
    isCeiling: boolean,
    isFloor: boolean
  ) => {
    if (isCeiling) return "text-purple-600";
    if (isFloor) return "text-sky-600";
    if (currentPrice > referencePrice) return "text-green-500";
    if (currentPrice < referencePrice) return "text-red-500";
    return "text-amber-500";
  };

  const getPriceBgColor = (
    currentPrice: number,
    referencePrice: number,
    isCeiling: boolean,
    isFloor: boolean
  ) => {
    if (isCeiling) return "bg-purple-50";
    if (isFloor) return "bg-sky-50";
    if (currentPrice > referencePrice) return "bg-green-50";
    if (currentPrice < referencePrice) return "bg-red-50";
    return "bg-black-50";
  };

  const getPriceChange = (currentPrice: number, referencePrice: number) => {
    const change = currentPrice - referencePrice;
    const percentage = (change / referencePrice) * 100;
    return {
      change,
      percentage: percentage.toFixed(2),
    };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full md:w-auto">
          Xem bảng giá chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full">
        <DialogHeader>
          <DialogTitle>Bảng giá chi tiết thị trường</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Mã CK</TableHead>
                <TableHead className="text-right">Giá trần</TableHead>
                <TableHead className="text-right">Giá sàn</TableHead>
                <TableHead className="text-right">TC</TableHead>
                <TableHead
                  colSpan={6}
                  className="text-center border-l border-r"
                >
                  Bên mua
                </TableHead>
                <TableHead colSpan={3} className="text-center border-r">
                  Khớp lệnh
                </TableHead>
                <TableHead colSpan={6} className="text-center">
                  Bên bán
                </TableHead>
                <TableHead className="text-right">Tổng KL</TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead className="text-right">Giá 3</TableHead>
                <TableHead className="text-right">KL 3</TableHead>
                <TableHead className="text-right">Giá 2</TableHead>
                <TableHead className="text-right">KL 2</TableHead>
                <TableHead className="text-right">Giá 1</TableHead>
                <TableHead className="text-right border-r">KL 1</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-right">KL</TableHead>
                <TableHead className="text-right border-r">+/-(%)</TableHead>
                <TableHead className="text-right">Giá 1</TableHead>
                <TableHead className="text-right">KL 1</TableHead>
                <TableHead className="text-right">Giá 2</TableHead>
                <TableHead className="text-right">KL 2</TableHead>
                <TableHead className="text-right">Giá 3</TableHead>
                <TableHead className="text-right">KL 3</TableHead>
                <TableHead className="text-right">KL</TableHead>
                <TableHead className="text-right">Cao nhất</TableHead>
                <TableHead className="text-right">Thấp nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks?.map((stock) => {
                const isCeiling = stock.GiaKhopCuoi === stock.GiaTran;
                const isFloor = stock.GiaKhopCuoi === stock.GiaSan;
                const priceColor = getPriceColor(
                  stock.GiaKhopCuoi || 0,
                  stock.GiaTC,
                  isCeiling,
                  isFloor
                );
                const priceBgColor = getPriceBgColor(
                  stock.GiaKhopCuoi || 0,
                  stock.GiaTC,
                  isCeiling,
                  isFloor
                );
                const priceInfo = getPriceChange(
                  stock.GiaKhopCuoi || 0,
                  stock.GiaTC
                );

                const displayValue = (value: number | undefined | null) =>
                  value === undefined || value === null || value === 0
                    ? "-"
                    : formatCurrency(value);

                const displayNumber = (value: number | undefined | null) =>
                  value === undefined || value === null || value === 0
                    ? "-"
                    : formatNumber(value);

                return (
                  <TableRow key={stock.MaCP}>
                    <TableCell className="font-medium">{stock.MaCP}</TableCell>
                    <TableCell className="text-right text-purple-600">
                      {displayValue(stock.GiaTran)}
                    </TableCell>
                    <TableCell className="text-right text-sky-600">
                      {displayValue(stock.GiaSan)}
                    </TableCell>
                    <TableCell className="text-right text-amber-500">
                      {displayValue(stock.GiaTC)}
                    </TableCell>
                    {/* Mock buy orders */}
                    <TableCell className="text-right text-green-500">
                      {displayValue(stock.GiaMua3)}
                    </TableCell>
                    <TableCell className="text-right">
                      {displayNumber(stock.KLMua3)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {displayValue(stock.GiaMua2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {displayNumber(stock.KLMua2)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {displayValue(stock.GiaMua1)}
                    </TableCell>
                    <TableCell className="text-right border-r">
                      {displayNumber(stock.KLMua1)}
                    </TableCell>
                    {/* Matched order */}
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        priceColor,
                        priceBgColor
                      )}
                    >
                      {displayValue(stock.GiaKhopCuoi)}
                    </TableCell>
                    <TableCell className="text-right">
                      {displayNumber(stock.TongKLKhop)}
                    </TableCell>
                    <TableCell
                      className={cn("text-right border-r", priceColor)}
                    >
                      {stock.ThayDoi > 0 ? "+" : ""}
                      {stock.PhanTramThayDoi || "-"}
                    </TableCell>
                    {/* Mock sell orders */}
                    <TableCell className="text-right text-red-500">
                      {displayValue(stock.GiaBan1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {displayNumber(stock.KLBan1)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {displayValue(stock.GiaBan2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {displayNumber(stock.KLBan2)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {displayValue(stock.GiaBan3)}
                    </TableCell>
                    <TableCell className="text-right">
                      {displayNumber(stock.KLBan3)}
                    </TableCell>
                    {/* Total volume */}
                    <TableCell className="text-right font-medium">
                      {displayNumber((stock.TongKLKhop || 0) * 1.5)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {displayValue(stock.GiaCaoNhat)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {displayValue(stock.GiaThapNhat)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedPriceBoardModal;
