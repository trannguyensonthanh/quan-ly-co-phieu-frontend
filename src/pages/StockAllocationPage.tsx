/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StockAllocationForm from "@/components/stocks/StockAllocationForm";
import { Stock, User } from "@/utils/types";
import { useGetStocksByStatusQuery } from "@/queries/stock.queries";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const StockAllocationPage = () => {
  const [unlistedStocks, setUnlistedStocks] = useState<Stock[]>([]);
  const [stockToList, setStockToList] = useState<Stock | null>(null);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const location = useLocation();
  const value = location.state || {}; // Phải check location.state tồn tại nhé
  console.log("Value from state:", value); // Kiểm tra giá trị từ state
  const {
    data: fetchedStocks,
    isError,
    isLoading,
  } = useGetStocksByStatusQuery(0);

  useEffect(() => {
    if (fetchedStocks) {
      setUnlistedStocks(fetchedStocks);
    }
  }, [fetchedStocks]);

  const handleListStock = (stock: Stock) => {
    setStockToList(stock);
    setShowListingDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phân bổ cổ phiếu</h1>
        <Button
          onClick={() => handleListStock(value)}
          variant="destructive"
          className="text-sm font-medium"
        >
          Niêm yết cổ phiếu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phân bổ cổ phiếu cho nhà đầu tư</CardTitle>
          <CardDescription>
            Phân bổ cổ phiếu chưa niêm yết cho các nhà đầu tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unlistedStocks.length > 0 ? (
            <StockAllocationForm
              stocks={unlistedStocks}
              stockDetail={value}
              setShowListingDialog={setShowListingDialog}
              stockToList={stockToList}
              showListingDialog={showListingDialog}
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                Không có cổ phiếu nào cần phân bổ
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAllocationPage;
