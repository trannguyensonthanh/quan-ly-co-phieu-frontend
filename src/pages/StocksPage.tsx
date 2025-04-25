import StockList from "@/components/stocks/StockList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StocksPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Danh sách cổ phiếu</h1>

      <Card>
        <CardHeader>
          <CardTitle>Cổ phiếu sàn Hà Nội</CardTitle>
          <CardDescription>
            Danh sách các cổ phiếu đang giao dịch trên sàn Hà Nội
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockList />
        </CardContent>
      </Card>
    </div>
  );
};

export default StocksPage;
