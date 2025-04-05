
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Search, RefreshCw } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { mockStocks } from '@/utils/mock-data';
import { formatCurrency, formatNumber } from '@/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const PriceBoardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredStocks = mockStocks.filter(stock => 
    stock.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to determine price color based on comparison with reference price
  const getPriceColor = (currentPrice: number, referencePrice: number, isCeiling: boolean, isFloor: boolean) => {
    if (isCeiling) return 'text-purple-600'; // Ceiling price
    if (isFloor) return 'text-sky-600';     // Floor price
    if (currentPrice > referencePrice) return 'text-green-500'; // Price up
    if (currentPrice < referencePrice) return 'text-red-500';   // Price down
    return 'text-amber-500'; // Reference price
  };

  // Function to determine price background color
  const getPriceBgColor = (currentPrice: number, referencePrice: number, isCeiling: boolean, isFloor: boolean) => {
    if (isCeiling) return 'bg-purple-50';
    if (isFloor) return 'bg-sky-50';
    if (currentPrice > referencePrice) return 'bg-green-50';
    if (currentPrice < referencePrice) return 'bg-red-50';
    return 'bg-amber-50';
  };

  // Calculate price change and percentage
  const getPriceChange = (currentPrice: number, referencePrice: number) => {
    const change = currentPrice - referencePrice;
    const percentage = (change / referencePrice) * 100;
    return {
      change,
      percentage: percentage.toFixed(2)
    };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng giá</h1>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm mã cổ phiếu..." 
            className="pl-8 pr-4" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Cập nhật: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="top-gainers">Tăng giá</TabsTrigger>
          <TabsTrigger value="top-losers">Giảm giá</TabsTrigger>
          <TabsTrigger value="high-volume">Khối lượng lớn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bảng giá thị trường</CardTitle>
              <CardDescription>
                Giá trần: <span className="text-purple-600">■</span> | 
                Giá tăng: <span className="text-green-500">■</span> | 
                Giá tham chiếu: <span className="text-amber-500">■</span> | 
                Giá giảm: <span className="text-red-500">■</span> | 
                Giá sàn: <span className="text-sky-600">■</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã CP</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-right">+/-</TableHead>
                      <TableHead className="text-right">Khối lượng</TableHead>
                      <TableHead className="text-right">Giá trần</TableHead>
                      <TableHead className="text-right">Giá sàn</TableHead>
                      <TableHead className="text-right">Giá TC</TableHead>
                      <TableHead className="text-right">Tổng KL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => {
                      const priceInfo = getPriceChange(stock.currentPrice, stock.referencePrice);
                      const isCeiling = stock.currentPrice === stock.ceilingPrice;
                      const isFloor = stock.currentPrice === stock.floorPrice;
                      const priceColor = getPriceColor(stock.currentPrice, stock.referencePrice, isCeiling, isFloor);
                      const priceBgColor = getPriceBgColor(stock.currentPrice, stock.referencePrice, isCeiling, isFloor);
                      
                      return (
                        <TableRow key={stock.code}>
                          <TableCell>
                            <div className="font-medium">{stock.code}</div>
                            <div className="text-xs text-muted-foreground">{stock.companyName.substring(0, 20)}...</div>
                          </TableCell>
                          <TableCell className={cn("text-right font-semibold", priceColor, priceBgColor)}>
                            {formatCurrency(stock.currentPrice)}
                          </TableCell>
                          <TableCell className={cn("text-right", priceColor)}>
                            {priceInfo.change > 0 ? '+' : ''}{formatCurrency(priceInfo.change)} ({priceInfo.change > 0 ? '+' : ''}{priceInfo.percentage}%)
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(stock.volume)}
                          </TableCell>
                          <TableCell className="text-right text-purple-600">
                            {formatCurrency(stock.ceilingPrice)}
                          </TableCell>
                          <TableCell className="text-right text-sky-600">
                            {formatCurrency(stock.floorPrice)}
                          </TableCell>
                          <TableCell className="text-right text-amber-500">
                            {formatCurrency(stock.referencePrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(stock.volume * 1.5)} {/* Just a mock total volume */}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {filteredStocks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Không tìm thấy dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="top-gainers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top cổ phiếu tăng giá</CardTitle>
              <CardDescription>
                Các cổ phiếu có tỷ lệ tăng giá cao nhất so với giá tham chiếu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                Dữ liệu đang được cập nhật...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="top-losers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top cổ phiếu giảm giá</CardTitle>
              <CardDescription>
                Các cổ phiếu có tỷ lệ giảm giá lớn nhất so với giá tham chiếu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                Dữ liệu đang được cập nhật...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="high-volume" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top cổ phiếu khối lượng lớn</CardTitle>
              <CardDescription>
                Các cổ phiếu có khối lượng giao dịch lớn nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                Dữ liệu đang được cập nhật...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceBoardPage;
