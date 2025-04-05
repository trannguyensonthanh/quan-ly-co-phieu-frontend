
import { Link } from 'react-router-dom';
import MarketSummary from '@/components/dashboard/MarketSummary';
import StockOverview from '@/components/dashboard/StockOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders, mockStockOwnerships, mockStocks } from '@/utils/mock-data';
import { formatCurrency, formatPriceChange, getPriceChangeClass } from '@/utils/format';
import { ArrowDown, ArrowRight, ArrowUp, LineChart, PieChart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Get top gainers and losers
  const topGainers = [...mockStocks]
    .sort((a, b) => {
      const aChange = (a.currentPrice - a.previousClose) / a.previousClose;
      const bChange = (b.currentPrice - b.previousClose) / b.previousClose;
      return bChange - aChange;
    })
    .slice(0, 3);
    
  const topLosers = [...mockStocks]
    .sort((a, b) => {
      const aChange = (a.currentPrice - a.previousClose) / a.previousClose;
      const bChange = (b.currentPrice - b.previousClose) / b.previousClose;
      return aChange - bChange;
    })
    .slice(0, 3);
    
  // Get recent orders
  const recentOrders = [...mockOrders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
    
  // Get user portfolio summary
  const portfolioItems = mockStockOwnerships.filter(item => item.userId === 'NDT001');
  const totalStocksOwned = portfolioItems.length;
  const totalQuantityOwned = portfolioItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Chào mừng đến với sàn giao dịch chứng khoán Hà Nội</p>
      </div>
      
      <MarketSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockOverview />
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tăng/Giảm mạnh nhất</CardTitle>
              <CardDescription>Cổ phiếu có biến động giá mạnh nhất</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1 text-stock-up" />
                  Top tăng giá
                </h3>
                <div className="space-y-2">
                  {topGainers.map(stock => {
                    const priceChangeClass = getPriceChangeClass(stock.currentPrice, stock.previousClose);
                    const changePercent = formatPriceChange(stock.currentPrice, stock.previousClose);
                    
                    return (
                      <Link to={`/stocks/${stock.code}`} key={stock.code} className="block">
                        <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold">{stock.code}</span>
                              <span className="text-sm text-muted-foreground ml-2">{stock.companyName.substring(0, 20)}...</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(stock.currentPrice)}</div>
                              <div className={`text-sm ${priceChangeClass}`}>{changePercent}</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  <ArrowDown className="h-4 w-4 mr-1 text-stock-down" />
                  Top giảm giá
                </h3>
                <div className="space-y-2">
                  {topLosers.map(stock => {
                    const priceChangeClass = getPriceChangeClass(stock.currentPrice, stock.previousClose);
                    const changePercent = formatPriceChange(stock.currentPrice, stock.previousClose);
                    
                    return (
                      <Link to={`/stocks/${stock.code}`} key={stock.code} className="block">
                        <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold">{stock.code}</span>
                              <span className="text-sm text-muted-foreground ml-2">{stock.companyName.substring(0, 20)}...</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(stock.currentPrice)}</div>
                              <div className={`text-sm ${priceChangeClass}`}>{changePercent}</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Danh mục đầu tư</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <PieChart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Cổ phiếu sở hữu</div>
                      <div className="text-2xl font-bold">{totalStocksOwned}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 border-t pt-2 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng CP sở hữu:</span>
                  <span className="font-medium">{totalQuantityOwned.toLocaleString()}</span>
                </div>
                
                <Link to="/portfolio">
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    Xem danh mục
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Giao dịch gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Lệnh đặt</div>
                      <div className="text-2xl font-bold">{recentOrders.length}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  {recentOrders.map((order, index) => (
                    <div key={order.id} className={`py-1 ${index !== recentOrders.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{order.stockCode}</span>
                        <span className={`text-sm ${order.type === 'M' ? 'text-blue-500' : 'text-red-500'}`}>
                          {order.type === 'M' ? 'Mua' : 'Bán'} {order.quantity.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link to="/trading">
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    Đặt lệnh
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
