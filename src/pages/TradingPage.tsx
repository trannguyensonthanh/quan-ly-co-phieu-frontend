
import OrderForm from "@/components/trading/OrderForm";
import TransactionHistory from "@/components/trading/TransactionHistory";

const TradingPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đặt lệnh</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OrderForm />
        </div>
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
