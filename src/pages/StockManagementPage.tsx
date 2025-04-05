
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockStocks } from "@/utils/mock-data";
import { Stock } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Save, Trash2, RefreshCw, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Schema for stock validation
const stockSchema = z.object({
  code: z.string().min(2, "Mã cổ phiếu phải có ít nhất 2 ký tự").max(5, "Mã cổ phiếu tối đa 5 ký tự"),
  companyName: z.string().min(5, "Tên công ty phải có ít nhất 5 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  totalShares: z.coerce.number().min(1, "Số lượng cổ phiếu phải lớn hơn 0"),
  referencePrice: z.coerce.number().min(1, "Giá tham chiếu phải lớn hơn 0"),
});

type StockFormValues = z.infer<typeof stockSchema>;

const StockManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      code: "",
      companyName: "",
      address: "",
      totalShares: 0,
      referencePrice: 0,
    },
  });

  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (values: StockFormValues) => {
    try {
      // Calculate limit prices based on reference price (typically +/- 7% in Vietnam)
      const referencePrice = values.referencePrice;
      const ceilingPrice = Math.round(referencePrice * 1.07 / 100) * 100; // Round to nearest 100
      const floorPrice = Math.round(referencePrice * 0.93 / 100) * 100; // Round to nearest 100
      
      const newStock: Stock = {
        code: values.code.toUpperCase(),
        companyName: values.companyName,
        address: values.address,
        totalShares: values.totalShares,
        currentPrice: values.referencePrice,
        previousClose: values.referencePrice,
        openPrice: values.referencePrice,
        highPrice: values.referencePrice,
        lowPrice: values.referencePrice,
        volume: 0,
        ceilingPrice,
        floorPrice,
        referencePrice: values.referencePrice
      };
      
      setStocks([...stocks, newStock]);
      setShowAddDialog(false);
      form.reset();
      
      toast({
        title: "Thêm cổ phiếu thành công",
        description: `Đã thêm cổ phiếu ${newStock.code} - ${newStock.companyName}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm cổ phiếu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStock = (stockCode: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa cổ phiếu này?")) {
      setStocks(stocks.filter(stock => stock.code !== stockCode));
      
      toast({
        title: "Xóa cổ phiếu thành công",
        description: `Đã xóa cổ phiếu ${stockCode}`,
      });
    }
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  const handleReloadStocks = () => {
    setStocks([...mockStocks]);
    toast({
      title: "Tải lại dữ liệu thành công",
      description: "Danh sách cổ phiếu đã được tải lại",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý cổ phiếu</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách cổ phiếu</CardTitle>
          <CardDescription>
            Quản lý cổ phiếu giao dịch trên sàn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm mã hoặc tên cổ phiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm cổ phiếu
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Thêm cổ phiếu mới</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã cổ phiếu</FormLabel>
                            <FormControl>
                              <Input placeholder="VNM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên công ty</FormLabel>
                            <FormControl>
                              <Input placeholder="Công ty CP Sữa Việt Nam" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                              <Input placeholder="Số 10 Tân Trào, Tân Phú, Quận 7, TP.HCM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="totalShares"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tổng số cổ phiếu</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="referencePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giá tham chiếu (VNĐ)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit">Thêm cổ phiếu</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={handleResetSearch}>
                <X className="mr-2 h-4 w-4" />
                Đặt lại
              </Button>
              
              <Button variant="outline" onClick={handleReloadStocks}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tải lại
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã CP</TableHead>
                  <TableHead>Tên công ty</TableHead>
                  <TableHead className="text-right">Giá tham chiếu</TableHead>
                  <TableHead className="text-right">Giá trần</TableHead>
                  <TableHead className="text-right">Giá sàn</TableHead>
                  <TableHead className="text-right">Tổng khối lượng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <TableRow key={stock.code}>
                      <TableCell className="font-medium">{stock.code}</TableCell>
                      <TableCell>{stock.companyName}</TableCell>
                      <TableCell className="text-right">{stock.referencePrice.toLocaleString()} VNĐ</TableCell>
                      <TableCell className="text-right text-stock-up">{stock.ceilingPrice.toLocaleString()} VNĐ</TableCell>
                      <TableCell className="text-right text-stock-down">{stock.floorPrice.toLocaleString()} VNĐ</TableCell>
                      <TableCell className="text-right">{stock.totalShares.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleDeleteStock(stock.code)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "Không tìm thấy cổ phiếu phù hợp" : "Chưa có cổ phiếu nào trong hệ thống"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManagementPage;
