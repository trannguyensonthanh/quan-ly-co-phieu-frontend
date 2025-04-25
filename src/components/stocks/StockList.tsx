import { useState } from "react";
import { Input } from "@/components/ui/input";
import { mockStocks } from "@/utils/mock-data";
import StockCard from "./StockCard";
import { Search } from "lucide-react";
import {
  useGetStockMarketDataQuery,
  useMarketBoardQuery,
} from "@/queries/stock.queries";

const StockList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: stockMarketData, isLoading } = useMarketBoardQuery({
    refetchInterval: 1000 * 15,
  });
  const filteredStocks = stockMarketData?.filter(
    (stock) =>
      stock?.MaCP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock?.TenCty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md mx-auto md:mx-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm mã cổ phiếu hoặc tên công ty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks?.length > 0 ? (
          filteredStocks?.map((stock) => (
            <StockCard key={stock.MaCP} stock={stock} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              Không tìm thấy cổ phiếu phù hợp với từ khóa "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;
