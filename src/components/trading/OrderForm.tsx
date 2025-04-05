
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockBankAccounts, mockStocks } from '@/utils/mock-data';
import { formatCurrency } from '@/utils/format';
import { OrderMethod, OrderType } from '@/utils/types';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface OrderFormProps {
  initialOrderType?: OrderType;
}

const OrderForm = ({ initialOrderType = 'M' }: OrderFormProps) => {
  const location = useLocation();
  const preselectedStockCode = location.state?.stockCode;
  
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [stockCode, setStockCode] = useState<string>(preselectedStockCode || '');
  const [orderMethod, setOrderMethod] = useState<OrderMethod>('LO');
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
  const [account, setAccount] = useState<string>('TK001');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get selected stock info
  const selectedStock = stockCode ? mockStocks.find(stock => stock.code === stockCode) : null;
  const accountInfo = mockBankAccounts.find(acc => acc.id === account);
  
  useEffect(() => {
    // When a stock is selected, set the default price to current price
    if (selectedStock) {
      setPrice(selectedStock.currentPrice);
    }
  }, [stockCode, selectedStock]);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const sanitizedValue = isNaN(value) ? 0 : value;
    
    // Check if multiple of 100
    if (sanitizedValue % 100 !== 0 && sanitizedValue !== 0) {
      toast.warning('Khối lượng phải là bội số của 100');
    }
    
    setQuantity(sanitizedValue);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const sanitizedValue = isNaN(value) ? 0 : value;
    
    // Check if multiple of 100
    if (sanitizedValue % 100 !== 0 && sanitizedValue !== 0) {
      toast.warning('Giá phải là bội số của 100');
    }
    
    setPrice(sanitizedValue);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockCode) {
      toast.error('Vui lòng chọn mã cổ phiếu');
      return;
    }
    
    if (quantity <= 0) {
      toast.error('Khối lượng phải lớn hơn 0');
      return;
    }
    
    if (quantity % 100 !== 0) {
      toast.error('Khối lượng phải là bội số của 100');
      return;
    }
    
    if (orderMethod === 'LO' && price <= 0) {
      toast.error('Giá phải lớn hơn 0');
      return;
    }
    
    if (orderMethod === 'LO' && price % 100 !== 0) {
      toast.error('Giá phải là bội số của 100');
      return;
    }
    
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu giao dịch');
      return;
    }
    
    // Validate price against ceiling/floor if LO order
    if (orderMethod === 'LO' && selectedStock) {
      if (price > selectedStock.ceilingPrice) {
        toast.error(`Giá không được vượt quá giá trần ${formatCurrency(selectedStock.ceilingPrice)}`);
        return;
      }
      
      if (price < selectedStock.floorPrice) {
        toast.error(`Giá không được thấp hơn giá sàn ${formatCurrency(selectedStock.floorPrice)}`);
        return;
      }
    }
    
    // Validate account balance for buy orders
    if (orderType === 'M' && accountInfo) {
      const orderValue = quantity * price;
      if (orderValue > accountInfo.balance) {
        toast.error('Số dư tài khoản không đủ để thực hiện giao dịch này');
        return;
      }
    }
    
    // For sell orders, validate the ownership
    if (orderType === 'B') {
      // This would be replaced with actual ownership verification
      const ownedStocks = 500; // Just an example
      if (quantity > ownedStocks) {
        toast.error(`Số lượng bán (${quantity}) vượt quá số lượng sở hữu (${ownedStocks})`);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`Đặt lệnh ${orderType === 'M' ? 'mua' : 'bán'} ${quantity} cổ phiếu ${stockCode} thành công`);
      setIsSubmitting(false);
      
      // Reset form after successful submission
      setQuantity(0);
      setPassword('');
    }, 1500);
  };
  
  const calculateOrderValue = () => {
    return quantity * price;
  };

  return (
    <Card className="w-full">
      <Tabs defaultValue="order">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{orderType === 'M' ? 'Đặt lệnh mua' : 'Đặt lệnh bán'}</CardTitle>
            <TabsList>
              <TabsTrigger value="order">Đặt lệnh</TabsTrigger>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
            </TabsList>
          </div>
          <CardDescription>
            Đặt lệnh {orderType === 'M' ? 'mua' : 'bán'} cổ phiếu trên sàn Hà Nội
          </CardDescription>
        </CardHeader>
        
        <TabsContent value="order">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account balance information */}
              {accountInfo && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="text-sm font-medium text-blue-800">Số dư tài khoản:</div>
                  <div className="text-lg font-bold text-blue-900">{formatCurrency(accountInfo.balance)}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Loại lệnh</Label>
                <RadioGroup 
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  className="flex"
                >
                  <div className="flex items-center space-x-2 w-1/2">
                    <RadioGroupItem value="M" id="buy" className="text-blue-500" />
                    <Label htmlFor="buy" className="text-blue-500 font-semibold">Mua</Label>
                  </div>
                  <div className="flex items-center space-x-2 w-1/2">
                    <RadioGroupItem value="B" id="sell" className="text-red-500" />
                    <Label htmlFor="sell" className="text-red-500 font-semibold">Bán</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Stock selection */}
              <div className="space-y-2">
                <Label htmlFor="stockCode">Mã cổ phiếu</Label>
                <Select 
                  value={stockCode}
                  onValueChange={setStockCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mã cổ phiếu" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStocks.map(stock => (
                      <SelectItem key={stock.code} value={stock.code}>
                        {stock.code} - {stock.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock price information */}
              {selectedStock && (
                <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-md">
                  <div className="p-1">
                    <div className="text-xs text-muted-foreground">Giá trần</div>
                    <div className="text-sm font-semibold text-purple-600">{formatCurrency(selectedStock.ceilingPrice)}</div>
                  </div>
                  <div className="p-1">
                    <div className="text-xs text-muted-foreground">Giá TC</div>
                    <div className="text-sm font-semibold text-amber-500">{formatCurrency(selectedStock.referencePrice)}</div>
                  </div>
                  <div className="p-1">
                    <div className="text-xs text-muted-foreground">Giá sàn</div>
                    <div className="text-sm font-semibold text-sky-600">{formatCurrency(selectedStock.floorPrice)}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="orderMethod">Phương thức</Label>
                <Select
                  value={orderMethod}
                  onValueChange={(value) => setOrderMethod(value as OrderMethod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LO">LO - Khớp lệnh liên tục</SelectItem>
                    <SelectItem value="ATO">ATO - Khớp lệnh mở cửa</SelectItem>
                    <SelectItem value="ATC">ATC - Khớp lệnh đóng cửa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Khối lượng</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="100"
                  value={quantity || ''}
                  onChange={handleQuantityChange}
                  placeholder="Nhập khối lượng cổ phiếu (bội số của 100)"
                />
                {orderType === 'B' && (
                  <div className="text-xs text-muted-foreground">
                    Số lượng sở hữu: 500 cổ phiếu {stockCode}
                  </div>
                )}
              </div>

              {orderMethod === 'LO' && (
                <div className="space-y-2">
                  <Label htmlFor="price">Giá đặt</Label>
                  <Input
                    id="price"
                    type="number"
                    min={selectedStock?.floorPrice || 0}
                    max={selectedStock?.ceilingPrice || 0}
                    step="100"
                    value={price || ''}
                    onChange={handlePriceChange}
                    placeholder="Nhập giá đặt (bội số của 100)"
                  />
                  {selectedStock && (
                    <div className="text-xs text-muted-foreground">
                      Biên độ giá: {formatCurrency(selectedStock.floorPrice)} - {formatCurrency(selectedStock.ceilingPrice)}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="account">Tài khoản</Label>
                <Select
                  value={account}
                  onValueChange={setAccount}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài khoản" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.id} - Số dư: {formatCurrency(acc.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu giao dịch</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu giao dịch của bạn"
                />
              </div>

              <Separator className="my-4" />

              {quantity > 0 && price > 0 && (
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tổng giá trị:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(calculateOrderValue())}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : `Đặt lệnh ${orderType === 'M' ? 'mua' : 'bán'}`
              }
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="info">
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Lệnh LO (Limit Order):</strong> Lệnh đặt theo phương thức khớp lệnh liên tục, 
                cho phép nhà đầu tư xác định giá mua/bán cụ thể. Lệnh sẽ được khớp khi có lệnh đối ứng 
                thoả mãn về giá.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Lệnh ATO (At The Open):</strong> Lệnh đặt theo phương thức khớp lệnh mở cửa. 
                Lệnh này được đặt trước giờ mở cửa và sẽ được khớp tại giá mở cửa.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Lệnh ATC (At The Close):</strong> Lệnh đặt theo phương thức khớp lệnh đóng cửa. 
                Lệnh này được đặt trước giờ đóng cửa và sẽ được khớp tại giá đóng cửa.
              </p>
              <div className="text-sm text-muted-foreground">
                <p><strong>Nguyên tắc khớp lệnh liên tục:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Ưu tiên về giá: Lệnh mua giá cao hơn được ưu tiên, lệnh bán giá thấp hơn được ưu tiên.</li>
                  <li>Ưu tiên về thời gian: Khi cùng giá, lệnh vào trước được ưu tiên.</li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Quy định đặt lệnh:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Khối lượng đặt lệnh phải là bội số của 100.</li>
                  <li>Giá đặt lệnh phải là bội số của 100.</li>
                  <li>Giá đặt lệnh phải nằm trong biên độ giá sàn - giá trần.</li>
                  <li>Đặt lệnh mua: Phải có đủ tiền trong tài khoản.</li>
                  <li>Đặt lệnh bán: Phải có đủ cổ phiếu trong danh mục.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default OrderForm;
