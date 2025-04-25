import { useState, useEffect } from "react";
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
  getPriceChangeClass,
} from "@/utils/format";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useMarketBoardQuery } from "@/queries/stock.queries";

const MarketSummary = () => {
  const [marketStats, setMarketStats] = useState({
    totalVolume: 0,
    totalValue: 0,
    increasingStocks: 0,
    decreasingStocks: 0,
    unchangedStocks: 0,
  });

  const { data: marketBoardData } = useMarketBoardQuery({
    refetchInterval: 1000 * 15,
  });

  useEffect(() => {
    if (marketBoardData) {
      const stats = marketBoardData.reduce(
        (acc, stock) => {
          const volume = stock.KLKhopCuoi;
          const value = stock.KLKhopCuoi * stock.GiaKhopCuoi;

          if (stock.GiaKhopCuoi > stock.GiaTC) {
            acc.increasingStocks += 1;
          } else if (stock.GiaKhopCuoi < stock.GiaTC) {
            acc.decreasingStocks += 1;
          } else {
            acc.unchangedStocks += 1;
          }

          acc.totalVolume += volume;
          acc.totalValue += value;

          return acc;
        },
        {
          totalVolume: 0,
          totalValue: 0,
          increasingStocks: 0,
          decreasingStocks: 0,
          unchangedStocks: 0,
        }
      );

      setMarketStats(stats);
    }
  }, [marketBoardData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Khối lượng giao dịch
          </CardTitle>
          <CardDescription>Tổng khối lượng giao dịch hôm nay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(marketStats.totalVolume)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">cổ phiếu</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Giá trị giao dịch
          </CardTitle>
          <CardDescription>Tổng giá trị giao dịch hôm nay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(marketStats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">VND</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Thị trường</CardTitle>
          <CardDescription>Phân bố tăng/giảm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpIcon className="h-4 w-4 text-stock-up" />
              <span className="text-stock-up">
                {marketStats.increasingStocks}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-stock-neutral">
                {marketStats.unchangedStocks}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowDownIcon className="h-4 w-4 text-stock-down" />
              <span className="text-stock-down">
                {marketStats.decreasingStocks}
              </span>
            </div>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-stock-up h-full"
                style={{
                  width: `${
                    (marketStats.increasingStocks / mockStocks.length) * 100
                  }%`,
                }}
              ></div>
              <div
                className="bg-stock-neutral h-full"
                style={{
                  width: `${
                    (marketStats.unchangedStocks / mockStocks.length) * 100
                  }%`,
                }}
              ></div>
              <div
                className="bg-stock-down h-full"
                style={{
                  width: `${
                    (marketStats.decreasingStocks / mockStocks.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSummary;
