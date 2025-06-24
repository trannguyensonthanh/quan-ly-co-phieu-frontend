import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockStocks } from '@/utils/mock-data';
import { formatCurrency, formatNumber } from '@/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useMarketBoardQuery } from '@/queries/stock.queries';
import DetailedPriceBoardModal from '@/components/trading/DetailedPriceBoardModal';
import { useMarketStream } from '@/hooks/useMarketStream';

const PriceBoardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketBoard, setMarketBoard] = useState([]);

  // Kích hoạt SSE listener
  useMarketStream(); // Hook này sẽ tự động cập nhật cache của React Query

  const {
    refetch: refetchMarketBoard,
    isLoading: isLoadingMarketBoard,
    isError: isErrorMarketBoard,
    error: errorMarketBoard,
    data: marketBoardData,
    isFetching: isFetchingMarketBoard,
    isSuccess: isSuccessMarketBoard,
  } = useMarketBoardQuery({ refetchInterval: false });

  useEffect(() => {
    // Fetch market board data on component mount
    console.log('Fetching market board data...', marketBoardData);
  }, [isSuccessMarketBoard, marketBoardData]);

  const handleRefresh = () => {
    refetchMarketBoard();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredStocks = mockStocks.filter(
    (stock) =>
      stock?.MaCP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock?.TenCty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to determine price color based on comparison with reference price
  const getPriceColor = (
    currentPrice: number,
    referencePrice: number,
    isCeiling: boolean,
    isFloor: boolean
  ) => {
    if (isCeiling) return 'text-purple-600'; // Ceiling price
    if (isFloor) return 'text-sky-600'; // Floor price
    if (currentPrice > referencePrice) return 'text-green-500'; // Price up
    if (currentPrice < referencePrice) return 'text-red-500'; // Price down
    return 'text-amber-500'; // Reference price
  };

  // Function to determine price background color
  const getPriceBgColor = (
    currentPrice: number,
    referencePrice: number,
    isCeiling: boolean,
    isFloor: boolean
  ) => {
    const color = localStorage.getItem('vite-ui-theme');
    if (isCeiling) return 'bg-purple-50';
    if (isFloor) return 'bg-sky-50';
    if (currentPrice > referencePrice) return 'bg-green-50';
    if (currentPrice < referencePrice) return 'bg-red-50';
    return color === 'dark' ? 'bg-black-50' : 'bg-white';
  };

  // Cột giá khớp lệnh: style đẹp cho cả dark/light
  const getPriceCellClass = (
    currentPrice: number,
    referencePrice: number,
    isCeiling: boolean,
    isFloor: boolean
  ) => {
    if (isCeiling)
      return 'text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-950';
    if (isFloor)
      return 'text-sky-600 bg-sky-50 dark:text-sky-300 dark:bg-sky-950';
    if (currentPrice > referencePrice)
      return 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-950';
    if (currentPrice < referencePrice)
      return 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-950';
    return 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950';
  };

  // Calculate price change and percentage
  if (isLoadingMarketBoard) return <p>Đang tải bảng giá...</p>;
  if (isErrorMarketBoard)
    return <p style={{ color: 'red' }}>Lỗi tải bảng giá</p>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bảng giá</h1>
        <DetailedPriceBoardModal stocks={marketBoardData} />
      </div>

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
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
            />
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
                Giá trần: <span className="text-purple-600">■</span> | Giá tăng:{' '}
                <span className="text-green-500">■</span> | Giá tham chiếu:{' '}
                <span className="text-amber-500">■</span> | Giá giảm:{' '}
                <span className="text-red-500">■</span> | Giá sàn:{' '}
                <span className="text-sky-600">■</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã CP</TableHead>
                      <TableHead className="text-right">Giá Khớp</TableHead>
                      <TableHead className="text-right">+/-</TableHead>

                      <TableHead className="text-right">Giá trần</TableHead>
                      <TableHead className="text-right">Giá sàn</TableHead>
                      <TableHead className="text-right">Giá TC</TableHead>
                      <TableHead className="text-right">Tổng KL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketBoardData?.map((stock) => {
                      const isCeiling = stock.GiaKhopCuoi === stock.GiaTran;
                      const isFloor = stock.GiaKhopCuoi === stock.GiaSan;
                      const priceColor = getPriceColor(
                        stock.GiaKhopCuoi,
                        stock.GiaTC,
                        isCeiling,
                        isFloor
                      );
                      const priceBgColor = getPriceBgColor(
                        stock.GiaKhopCuoi,
                        stock.GiaTC,
                        isCeiling,
                        isFloor
                      );

                      const formatValue = (value: number | null | undefined) =>
                        value === null || value === undefined || value === 0
                          ? '-'
                          : formatCurrency(value);

                      return (
                        <TableRow key={stock.MaCP}>
                          <TableCell>
                            <div className="font-medium">{stock.MaCP}</div>
                            <div className="text-xs text-muted-foreground">
                              {stock.TenCty.substring(0, 20)}...
                            </div>
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-semibold rounded transition-colors duration-200',
                              getPriceCellClass(
                                stock.GiaKhopCuoi,
                                stock.GiaTC,
                                isCeiling,
                                isFloor
                              )
                            )}
                          >
                            {formatValue(stock.GiaKhopCuoi)}
                          </TableCell>
                          <TableCell className={cn('text-right', priceColor)}>
                            {stock.ThayDoi > 0 ? '+' : ''}
                            {stock.ThayDoi} ({stock.ThayDoi > 0 ? '+' : ''}
                            {stock.PhanTramThayDoi ?? '-'}%)
                          </TableCell>

                          <TableCell className="text-right text-purple-600">
                            {formatValue(stock.GiaTran)}
                          </TableCell>
                          <TableCell className="text-right text-sky-600">
                            {formatValue(stock.GiaSan)}
                          </TableCell>
                          <TableCell className="text-right text-amber-500">
                            {formatValue(stock.GiaTC)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(stock.TongKLKhop) || '-'}
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
