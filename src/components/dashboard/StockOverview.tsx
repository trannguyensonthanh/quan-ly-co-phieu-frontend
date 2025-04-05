
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { mockStocks } from '@/utils/mock-data';
import { 
  formatCurrency, 
  formatNumber, 
  formatPriceChange, 
  getPriceChangeClass 
} from '@/utils/format';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const StockOverview = () => {
  // Sort stocks by trading volume (descending)
  const topStocks = [...mockStocks]
    .sort((a, b) => b.volume - a.volume)
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
              const priceChangeClass = getPriceChangeClass(stock.currentPrice, stock.previousClose);
              const isPriceUp = stock.currentPrice > stock.previousClose;
              const isPriceDown = stock.currentPrice < stock.previousClose;
              
              return (
                <TableRow key={stock.code}>
                  <TableCell className="font-medium">
                    <Link to={`/stocks/${stock.code}`} className="hover:text-primary transition-colors">
                      {stock.code}
                    </Link>
                  </TableCell>
                  <TableCell>{formatCurrency(stock.currentPrice)}</TableCell>
                  <TableCell className={priceChangeClass}>
                    <div className="flex items-center space-x-1">
                      {isPriceUp && <ArrowUpIcon className="h-3 w-3" />}
                      {isPriceDown && <ArrowDownIcon className="h-3 w-3" />}
                      <span>{formatPriceChange(stock.currentPrice, stock.previousClose)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatNumber(stock.volume)}</TableCell>
                  <TableCell className="hidden md:table-cell text-stock-up">{formatCurrency(stock.ceilingPrice)}</TableCell>
                  <TableCell className="hidden md:table-cell text-stock-down">{formatCurrency(stock.floorPrice)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-4 text-right">
          <Link 
            to="/stocks" 
            className="text-sm text-primary hover:underline"
          >
            Xem tất cả cổ phiếu
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockOverview;
