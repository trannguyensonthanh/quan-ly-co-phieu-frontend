
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockOrders, mockTransactions } from '@/utils/mock-data';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, formatNumber, formatOrderType, getOrderTypeColor, getStatusColor } from '@/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Get matching transaction for an order
  const getOrderTransactions = (orderId: number) => {
    return mockTransactions.filter(transaction => transaction.orderId === orderId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <TabsList>
            <TabsTrigger 
              value="orders" 
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? 'bg-primary text-primary-foreground' : ''}
            >
              Lệnh đặt
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              onClick={() => setActiveTab('transactions')}
              className={activeTab === 'transactions' ? 'bg-primary text-primary-foreground' : ''}
            >
              Lệnh khớp
            </TabsTrigger>
          </TabsList>
        </div>
        <CardDescription>
          {activeTab === 'orders' 
            ? 'Lịch sử các lệnh đặt mua bán cổ phiếu'
            : 'Lịch sử các lệnh đã khớp'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeTab === 'orders' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mã CP</TableHead>
                <TableHead className="hidden md:table-cell">Khối lượng</TableHead>
                <TableHead className="hidden md:table-cell">Giá</TableHead>
                <TableHead className="hidden md:table-cell">Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{formatDateTime(order.date)}</TableCell>
                  <TableCell className={getOrderTypeColor(order.type)}>
                    {formatOrderType(order.type)}
                  </TableCell>
                  <TableCell>{order.stockCode}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatNumber(order.quantity)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatCurrency(order.price)}</TableCell>
                  <TableCell className="hidden md:table-cell">{order.method}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã khớp</TableHead>
                <TableHead>Mã GD</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khối lượng</TableHead>
                <TableHead>Giá khớp</TableHead>
                <TableHead>Kiểu khớp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.orderId}</TableCell>
                  <TableCell>{formatDateTime(transaction.date)}</TableCell>
                  <TableCell>{formatNumber(transaction.quantity)}</TableCell>
                  <TableCell>{formatCurrency(transaction.price)}</TableCell>
                  <TableCell>{transaction.matchType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {(activeTab === 'orders' && mockOrders.length === 0) || 
         (activeTab === 'transactions' && mockTransactions.length === 0) ? (
          <div className="text-center py-6 text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
