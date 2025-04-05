
import { Card, CardContent } from '@/components/ui/card';
import { Stock } from '@/utils/types';
import { formatCurrency, formatPriceChange, getPriceChangeClass } from '@/utils/format';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StockCardProps {
  stock: Stock;
}

const StockCard = ({ stock }: StockCardProps) => {
  const priceChangeClass = getPriceChangeClass(stock.currentPrice, stock.previousClose);
  const isPriceUp = stock.currentPrice > stock.previousClose;
  const isPriceDown = stock.currentPrice < stock.previousClose;
  
  return (
    <Link to={`/stocks/${stock.code}`}>
      <Card className="hover:shadow-md transition-all duration-300 h-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{stock.code}</h3>
              <p className="text-sm text-muted-foreground truncate" title={stock.companyName}>
                {stock.companyName}
              </p>
            </div>
            <div className={`text-right ${priceChangeClass}`}>
              <p className="font-bold text-lg">{formatCurrency(stock.currentPrice)}</p>
              <div className="flex items-center justify-end space-x-1 text-sm">
                {isPriceUp && <ArrowUpIcon className="h-3 w-3" />}
                {isPriceDown && <ArrowDownIcon className="h-3 w-3" />}
                <span>{formatPriceChange(stock.currentPrice, stock.previousClose)}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Giá trần</p>
              <p className="font-medium text-stock-up">{formatCurrency(stock.ceilingPrice)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Giá sàn</p>
              <p className="font-medium text-stock-down">{formatCurrency(stock.floorPrice)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mở cửa</p>
              <p className="font-medium">{formatCurrency(stock.openPrice)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tham chiếu</p>
              <p className="font-medium">{formatCurrency(stock.referencePrice)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default StockCard;
