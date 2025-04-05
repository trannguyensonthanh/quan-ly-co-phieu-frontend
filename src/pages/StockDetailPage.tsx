
import StockDetail from "@/components/stocks/StockDetail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { mockStocks } from "@/utils/mock-data";

const StockDetailPage = () => {
  const { stockCode } = useParams<{ stockCode: string }>();
  const stockInfo = stockCode ? mockStocks.find(stock => stock.code === stockCode) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {stockInfo ? `${stockInfo.code} - ${stockInfo.companyName}` : 'Chi tiết cổ phiếu'}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cổ phiếu</CardTitle>
          <CardDescription>
            Chi tiết thông tin giao dịch và biến động giá
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockDetail />
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDetailPage;
