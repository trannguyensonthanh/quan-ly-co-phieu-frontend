import OrderForm from "@/components/trading/OrderForm";
import TransactionHistory from "@/components/trading/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Order } from "@/utils/types";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
const TradingPage = () => {
  const [orderToModify, setOrderToModify] = useState<Order | null>(null);

  const handleModifyOrder = (order: Order) => {
    // Chỉ cho phép sửa lệnh LO và trong giờ giao dịch LO
    const now = new Date();
    // const isLOSession = now.getHours() >= 9 && now.getHours() < 14.3;
    const isLOSession = true;

    if (order.LoaiLenh.trim() !== "LO") {
      toast({
        title: "Không thể sửa lệnh",
        description: "Chỉ có thể sửa lệnh LO",
        variant: "destructive",
      });
      return;
    }

    if (!isLOSession) {
      toast({
        title: "Không thể sửa lệnh",
        description:
          "Chỉ có thể sửa lệnh trong phiên giao dịch LO (9:00 - 14:30)",
        variant: "destructive",
      });
      return;
    }

    if (order.TrangThai === "Hết" || order.TrangThai === "Hủy") {
      toast({
        title: "Không thể sửa lệnh",
        description: "Chỉ có thể sửa lệnh chưa khớp hoặc khớp một phần",
        variant: "destructive",
      });
      return;
    }

    setOrderToModify(order);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đặt lệnh</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bảng giá thị trường</CardTitle>
          <CardDescription>
            Theo dõi diễn biến thị trường để đưa ra quyết định đầu tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">VN-Index</div>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-green-500">
                  1,245.67
                </span>
                <span className="ml-2 text-sm text-green-500">
                  +12.34 (+1.02%)
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">HNX-Index</div>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-red-500">398.76</span>
                <span className="ml-2 text-sm text-red-500">
                  -2.45 (-0.61%)
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">UPCOM-Index</div>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-green-500">95.23</span>
                <span className="ml-2 text-sm text-green-500">
                  +0.75 (+0.79%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">
            Đặt lệnh mua
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">
            Đặt lệnh bán
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <OrderForm
                initialOrderType="M"
                orderToModify={orderToModify}
                setOrderToModify={setOrderToModify}
                onModifyComplete={() => setOrderToModify(null)}
              />
            </div>
            <div className="lg:col-span-2">
              <TransactionHistory onModifyOrder={handleModifyOrder} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sell">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <OrderForm
                initialOrderType="B"
                orderToModify={orderToModify}
                setOrderToModify={setOrderToModify}
                onModifyComplete={() => setOrderToModify(null)}
              />
            </div>
            <div className="lg:col-span-2">
              <TransactionHistory onModifyOrder={handleModifyOrder} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingPage;
