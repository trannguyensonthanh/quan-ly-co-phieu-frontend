
import StockList from "@/components/stocks/StockList";

const StocksPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Danh sách cổ phiếu</h1>
      <StockList />
    </div>
  );
};

export default StocksPage;
