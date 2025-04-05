
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockStocks } from '@/utils/mock-data';
import { Stock } from '@/utils/types';
import { 
  formatCurrency, 
  formatNumber, 
  formatPriceChange, 
  getPriceChangeClass 
} from '@/utils/format';
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, ShoppingBag } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const StockDetail = () => {
  const { stockCode } = useParams<{ stockCode: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Find the stock from mock data
    const foundStock = mockStocks.find(s => s.code === stockCode);
    
    if (foundStock) {
      setStock(foundStock);
      
      // Generate mock chart data for the last 30 days
      const mockChartData = generateMockChartData(foundStock, 30);
      setChartData(mockChartData);
    }
  }, [stockCode]);

  // Generate random price data for chart
  const generateMockChartData = (stock: Stock, days: number) => {
    const data = [];
    const today = new Date();
    let lastPrice = stock.previousClose;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Random price change between -3% and +3%
      const changePercent = (Math.random() * 6) - 3;
      const priceChange = lastPrice * (changePercent / 100);
      const price = lastPrice + priceChange;
      
      lastPrice = price;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 500000,
      });
    }
    
    return data;
  };

  const goBack = () => {
    navigate(-1);
  };

  const goToTradingPage = () => {
    navigate('/trading', { state: { stockCode: stock?.code } });
  };

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground mb-4">Không tìm thấy thông tin cổ phiếu</p>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const priceChangeClass = getPriceChangeClass(stock.currentPrice, stock.previousClose);
  const isPriceUp = stock.currentPrice > stock.previousClose;
  const isPriceDown = stock.currentPrice < stock.previousClose;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={goBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {stock.code}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {stock.companyName}
            </span>
          </h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ giá</CardTitle>
            <CardDescription>
              Diễn biến giá 30 ngày gần nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Giá']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `Ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#1890ff" 
                    fill="#1890ff" 
                    fillOpacity={0.1} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Thông tin giá</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Giá hiện tại</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${priceChangeClass}`}>
                      {formatCurrency(stock.currentPrice)}
                    </p>
                    <div className={`flex items-center space-x-1 ${priceChangeClass}`}>
                      {isPriceUp && <ArrowUpIcon className="h-4 w-4" />}
                      {isPriceDown && <ArrowDownIcon className="h-4 w-4" />}
                      <span>{formatPriceChange(stock.currentPrice, stock.previousClose)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Giá trần</p>
                    <p className="font-medium text-stock-up">{formatCurrency(stock.ceilingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Giá sàn</p>
                    <p className="font-medium text-stock-down">{formatCurrency(stock.floorPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Tham chiếu</p>
                    <p className="font-medium">{formatCurrency(stock.referencePrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Mở cửa</p>
                    <p className="font-medium">{formatCurrency(stock.openPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Cao nhất</p>
                    <p className="font-medium">{formatCurrency(stock.highPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Thấp nhất</p>
                    <p className="font-medium">{formatCurrency(stock.lowPrice)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground text-sm">Khối lượng giao dịch</p>
                  <p className="font-medium">{formatNumber(stock.volume)} cổ phiếu</p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={goToTradingPage}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Đặt lệnh
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Thông tin công ty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground text-sm">Tên công ty</p>
                  <p className="font-medium">{stock.companyName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Địa chỉ</p>
                  <p className="font-medium">{stock.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Số cổ phiếu phát hành</p>
                  <p className="font-medium">{formatNumber(stock.totalShares)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
