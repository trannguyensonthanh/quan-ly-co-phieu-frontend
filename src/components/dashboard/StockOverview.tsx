import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockStocks } from "@/utils/mock-data";
import {
  formatCurrency,
  formatNumber,
  formatPriceChange,
  getPriceChangeClass,
} from "@/utils/format";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useMarketBoardQuery } from "@/queries/stock.queries";

const StockOverview = () => {
  // Sort stocks by trading volume (descending)
  const { data: marketBoardData } = useMarketBoardQuery({
    refetchInterval: 1000 * 15,
  });
  const topStocks = [...(marketBoardData || [])]
    .sort((a, b) => b.KLKhopCuoi - a.KLKhopCuoi)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan thị trường</CardTitle>
        <CardDescription>
          Top 5 cổ phiếu có khối lượng giao dịch lớn nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã CP</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Thay đổi</TableHead>
              <TableHead className="hidden md:table-cell">Khối lượng</TableHead>
              <TableHead className="hidden md:table-cell">Giá trần</TableHead>
              <TableHead className="hidden md:table-cell">Giá sàn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topStocks.map((stock) => {
              const priceChangeClass = getPriceChangeClass(
                stock.GiaKhopCuoi,
                stock.GiaTC
              );
              const isPriceUp =
                stock.GiaTC !== null && stock.GiaKhopCuoi > stock.GiaTC;
              const isPriceDown =
                stock.GiaTC !== null && stock.GiaKhopCuoi < stock.GiaTC;
              console.log(stock.GiaKhopCuoi, stock.GiaTC, priceChangeClass);
              return (
                <TableRow key={stock.MaCP}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/stocks/${stock.MaCP}`}
                      className="hover:text-primary transition-colors"
                    >
                      {stock.MaCP}
                    </Link>
                  </TableCell>
                  <TableCell>{formatCurrency(stock.GiaKhopCuoi)}</TableCell>
                  <TableCell className={priceChangeClass}>
                    <div className="flex items-center space-x-1">
                      {isPriceUp && <ArrowUpIcon className="h-3 w-3" />}
                      {isPriceDown && <ArrowDownIcon className="h-3 w-3" />}
                      <span>
                        {formatPriceChange(stock.GiaKhopCuoi, stock.GiaTC)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatNumber(stock.KLKhopCuoi)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-stock-up">
                    {formatCurrency(stock.GiaTran)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-stock-down">
                    {formatCurrency(stock.GiaSan)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-4 text-right">
          <Link to="/stocks" className="text-sm text-primary hover:underline">
            Xem tất cả cổ phiếu
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockOverview;
