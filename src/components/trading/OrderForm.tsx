/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockBankAccounts, mockStocks } from "@/utils/mock-data";
import { formatCurrency } from "@/utils/format";
import { OrderMethod, OrderType } from "@/utils/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  useGetAllStocksQuery,
  useGetStockMarketDataQuery,
} from "@/queries/stock.queries";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetInvestorBankAccountsQuery } from "@/queries/investor.queries";
import { usePlaceOrderMutation } from "@/queries/trading.queries";
import { useGetMyStockQuantityQuery } from "@/queries/portfolio.queries";

interface OrderFormProps {
  initialOrderType?: OrderType;
}

const OrderForm = ({ initialOrderType = "M" }: OrderFormProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();
  const preselectedStockCode = location.state?.stockCode;
  console.log("Preselected stock code:", preselectedStockCode);
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [stockCode, setStockCode] = useState<string>(
    preselectedStockCode || ""
  );
  const [orderMethod, setOrderMethod] = useState<OrderMethod>("LO");
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [password, setPassword] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: selectedStock,
    isLoading: isLoadingMarketData,
    refetch: refetchMarketData,
  } = useGetStockMarketDataQuery(stockCode);

  useEffect(() => {
    if (stockCode) {
      refetchMarketData();
    }
    console.log("Selected stock data:", selectedStock);
  }, [stockCode]);

  const formSchema = z.object({
    orderType: z.enum(["M", "B"], { required_error: "Loại lệnh là bắt buộc" }),
    MaCP: z.string().min(1, "Mã cổ phiếu là bắt buộc"),
    LoaiLenh: z.enum(["LO", "ATO", "ATC"], {
      required_error: "Phương thức là bắt buộc",
    }),
    SoLuong: z
      .number()
      .min(100, "Khối lượng phải lớn hơn hoặc bằng 100")
      .multipleOf(100, "Khối lượng phải là bội số của 100"),
    Gia: z
      .number()
      .optional()
      .refine((val) => val === undefined || val % 100 === 0, {
        message: "Giá phải là bội số của 100",
      }),
    MaTK: z.string().min(1, "Tài khoản là bắt buộc"),
    transactionPassword: z.string().min(1, "Mật khẩu giao dịch là bắt buộc"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderType: initialOrderType,
      MaCP: preselectedStockCode || "",
      LoaiLenh: "LO",
      SoLuong: 100,
      Gia: selectedStock?.GiaKhopCuoi || 0,
      MaTK: "",
      transactionPassword: "",
    },
  });

  useEffect(() => {
    if (selectedStock) {
      form.setValue("Gia", selectedStock.GiaKhopCuoi);
      setPrice(selectedStock.GiaKhopCuoi);
    }
  }, [selectedStock]);
  const { data: allStocks, isLoading: isLoadingStocks } =
    useGetAllStocksQuery();

  // Lây thông tin tài khoản ngân hàng của nhà đầu tư
  const {
    data: bankAccounts,
    isLoading: isLoadingBankAccounts,
    refetch: isRefetchBankAccounts,
  } = useGetInvestorBankAccountsQuery(user?.username);
  const [accountInfo, setAccountInfo] = useState(null); // Use state for account info

  useEffect(() => {
    if (account && bankAccounts) {
      const selectedAccount = bankAccounts.find((acc) => acc.MaTK === account);
      setAccountInfo(selectedAccount);
    }
  }, [account, bankAccounts]);

  useEffect(() => {
    if (!isLoadingStocks && allStocks) {
      console.log("Fetched stocks:", allStocks);
    }
  }, [isLoadingStocks, allStocks]);

  // Get selected stock info

  useEffect(() => {
    // When a stock is selected, set the default price to current price
    if (selectedStock) {
      setPrice(selectedStock.GiaKhopCuoi);
    }
  }, [stockCode, selectedStock]);

  const placeOrderMutation = usePlaceOrderMutation();

  const {
    data: myStockQuantity,
    isLoading: isLoadingMyStockQuantity,
    refetch: isRefetchMyStockQuantity,
  } = useGetMyStockQuantityQuery(stockCode.trim());

  useEffect(() => {
    if (stockCode) {
      isRefetchMyStockQuantity();
    }
  }, [stockCode, isRefetchMyStockQuantity]);

  const handleStockCodeChange = (value: string) => {
    setStockCode(value);
    console.log("Selected stock code:", value);
    const stock = allStocks?.find((stock) => stock.MaCP === value);
    if (stock) {
      setPrice((stock as any).GiaKhopCuoi || 0); // Set default price to current price
    } else {
      setPrice(0); // Reset price if stock not found
    }
  };

  const handleAccountChange = (value: string) => {
    setAccount(value);
    console.log("Selected account:", value);
    const selectedAccount = bankAccounts?.find((acc) => acc.MaTK === value);
    if (selectedAccount) {
      console.log("Account details:", selectedAccount);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const sanitizedValue = isNaN(value) ? 0 : value;

    // Check if multiple of 100
    if (sanitizedValue % 100 !== 0 && sanitizedValue !== 0) {
      toast.warning("Khối lượng phải là bội số của 100");
    }

    setQuantity(sanitizedValue);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const sanitizedValue = isNaN(value) ? 0 : value;

    // Check if multiple of 100
    if (sanitizedValue % 100 !== 0 && sanitizedValue !== 0) {
      toast.warning("Giá phải là bội số của 100");
    }

    setPrice(sanitizedValue);
  };

  const handleSubmit = (data: {
    orderType: OrderType;
    MaCP: string;
    SoLuong: number;
    Gia: number;
    LoaiLenh: OrderMethod;
    MaTK: string;
    transactionPassword: string;
  }) => {
    if (!data.MaCP) {
      toast.error("Vui lòng chọn mã cổ phiếu");
      return;
    }

    if (data.SoLuong <= 0) {
      toast.error("Khối lượng phải lớn hơn 0");
      return;
    }

    if (data.SoLuong % 100 !== 0) {
      toast.error("Khối lượng phải là bội số của 100");
      return;
    }

    if (data.LoaiLenh === "LO" && data.Gia <= 0) {
      toast.error("Giá phải lớn hơn 0");
      return;
    }

    if (data.LoaiLenh === "LO" && data.Gia % 100 !== 0) {
      toast.error("Giá phải là bội số của 100");
      return;
    }

    if (!data.transactionPassword) {
      toast.error("Vui lòng nhập mật khẩu giao dịch");
      return;
    }

    // Validate price against ceiling/floor if LO order
    if (data.LoaiLenh === "LO" && selectedStock) {
      if (data.Gia > selectedStock.GiaTran) {
        toast.error(
          `Giá không được vượt quá giá trần ${formatCurrency(
            selectedStock.GiaTran
          )}`
        );
        return;
      }

      if (data.Gia < selectedStock.GiaSan) {
        toast.error(
          `Giá không được thấp hơn giá sàn ${formatCurrency(
            selectedStock.GiaSan
          )}`
        );
        return;
      }
    }

    // Validate account balance for buy orders
    if (orderType === "M" && accountInfo) {
      const orderValue = data.SoLuong * data.Gia;
      if (orderValue > accountInfo.SoTien) {
        toast.error("Số dư tài khoản không đủ để thực hiện giao dịch này");
        return;
      }
    }

    setIsSubmitting(true);
    const orderData = { ...data };
    if (orderData.LoaiLenh === "ATO" || orderData.LoaiLenh === "ATC") {
      delete orderData.Gia; // Remove Gia if LoaiLenh is ATO or ATC
    }
    console.log("Submitting order:", orderData);
    placeOrderMutation.mutate(
      { orderData, type: orderType },
      {
        onSuccess: () => {
          toast.success(
            `Đặt lệnh ${orderType === "M" ? "mua" : "bán"} ${
              data.SoLuong
            } cổ phiếu ${data.MaCP} thành công`
          );
          setIsSubmitting(false);

          // Reset form after successful submission
          setQuantity(0);
          setPassword("");
          isRefetchBankAccounts(); // Refetch bank accounts to update balance
        },
        onError: (error: any) => {
          toast.error(
            `Đặt lệnh thất bại: ${error.message || "Lỗi không xác định"}`
          );
          setIsSubmitting(false);
        },
      }
    );
  };

  const calculateOrderValue = () => {
    return quantity * price;
  };

  return (
    <Card className="w-full">
      <Tabs defaultValue="order">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {orderType === "M" ? "Đặt lệnh mua" : "Đặt lệnh bán"}
            </CardTitle>
            <TabsList>
              <TabsTrigger value="order">Đặt lệnh</TabsTrigger>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
            </TabsList>
          </div>
          <CardDescription>
            Đặt lệnh {orderType === "M" ? "mua" : "bán"} cổ phiếu trên sàn Hà
            Nội
          </CardDescription>
        </CardHeader>
        <TabsContent value="order">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {accountInfo && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Số dư tài khoản:
                    </div>
                    {formatCurrency(accountInfo.SoTien)}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="MaCP"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Mã cổ phiếu</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleStockCodeChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mã cổ phiếu" />
                        </SelectTrigger>
                        <SelectContent>
                          {allStocks?.map((stock) => (
                            <SelectItem key={stock.MaCP} value={stock.MaCP}>
                              {stock.MaCP} - {stock.TenCty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {selectedStock && (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="p-1">
                      <div className="text-xs text-muted-foreground dark:text-gray-400">
                        Giá trần
                      </div>
                      <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {formatCurrency(selectedStock.GiaTran)}
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="text-xs text-muted-foreground dark:text-gray-400">
                        Giá TC
                      </div>
                      <div className="text-sm font-semibold text-amber-500 dark:text-amber-300">
                        {formatCurrency(selectedStock.GiaTC)}
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="text-xs text-muted-foreground dark:text-gray-400">
                        Giá sàn
                      </div>
                      <div className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                        {formatCurrency(selectedStock.GiaSan)}
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="LoaiLenh"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Phương thức</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value as OrderMethod);
                          setOrderMethod(value as OrderMethod);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phương thức" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LO">
                            LO - Khớp lệnh liên tục
                          </SelectItem>
                          <SelectItem value="ATO">
                            ATO - Khớp lệnh mở cửa
                          </SelectItem>
                          <SelectItem value="ATC">
                            ATC - Khớp lệnh đóng cửa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="SoLuong"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Khối lượng</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        min="100"
                        step="100"
                        placeholder="Nhập khối lượng cổ phiếu (bội số của 100)"
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10); // Chuyển đổi chuỗi thành số
                          field.onChange(isNaN(value) ? 0 : value); // Đặt giá trị mặc định là 0 nếu không hợp lệ
                        }}
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                      {orderType === "B" && (
                        <div className="text-xs text-muted-foreground">
                          Số lượng sở hữu: {myStockQuantity?.soLuong || 0} cổ
                          phiếu {stockCode}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {orderMethod === "LO" && (
                  <FormField
                    control={form.control}
                    name="Gia"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Giá đặt</FormLabel>
                        <Input
                          {...field}
                          type="number"
                          min={selectedStock?.GiaSan || 0}
                          max={selectedStock?.GiaTran || 0}
                          step="100"
                          placeholder="Nhập giá đặt (bội số của 100)"
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10); // Chuyển đổi chuỗi thành số
                            field.onChange(isNaN(value) ? 0 : value); // Đặt giá trị mặc định là 0 nếu không hợp lệ
                          }}
                        />
                        {selectedStock && (
                          <div className="text-xs text-muted-foreground">
                            Biên độ giá: {formatCurrency(selectedStock.GiaSan)}{" "}
                            - {formatCurrency(selectedStock.GiaTran)}
                          </div>
                        )}
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="MaTK"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Tài khoản</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleAccountChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tài khoản" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts?.map((acc) => (
                            <SelectItem key={acc.MaTK} value={acc.MaTK}>
                              {acc.MaTK} - Số dư: {formatCurrency(acc.SoTien)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu giao dịch</FormLabel>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Nhập mật khẩu giao dịch của bạn"
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

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

                <CardFooter>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : `Đặt lệnh ${orderType === "M" ? "mua" : "bán"}`}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </TabsContent>

        <TabsContent value="info">
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Lệnh LO (Limit Order):</strong> Lệnh đặt theo phương
                thức khớp lệnh liên tục, cho phép nhà đầu tư xác định giá
                mua/bán cụ thể. Lệnh sẽ được khớp khi có lệnh đối ứng thoả mãn
                về giá.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Lệnh ATO (At The Open):</strong> Lệnh đặt theo phương
                thức khớp lệnh mở cửa. Lệnh này được đặt trước giờ mở cửa và sẽ
                được khớp tại giá mở cửa.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Lệnh ATC (At The Close):</strong> Lệnh đặt theo phương
                thức khớp lệnh đóng cửa. Lệnh này được đặt trước giờ đóng cửa và
                sẽ được khớp tại giá đóng cửa.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Nguyên tắc khớp lệnh liên tục:</strong>
                </p>
                <ul className="list-disc pl-5 spac</ul>e-y-1 mt-2">
                  <li>
                    Ưu tiên về giá: Lệnh mua giá cao hơn được ưu tiên, lệnh bán
                    giá thấp hơn được ưu tiên.
                  </li>
                  <li>
                    Ưu tiên về thời gian: Khi cùng giá, lệnh vào trước được ưu
                    tiên.
                  </li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Quy định đặt lệnh:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Khối lượng đặt lệnh phải là bội số của 100.</li>
                  <li>Giá đặt lệnh phải là bội số của 100.</li>
                  <li>
                    Giá đặt lệnh phải nằm trong biên độ giá sàn - giá trần.
                  </li>
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

{
  /* <FormField
                  control={form.control}
                  name="orderType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Loại lệnh</FormLabel>
                      <RadioGroup
                        {...field}
                        onValueChange={(value) => {
                          field.onChange(value as OrderType);
                          setOrderType(value as OrderType);
                        }}
                        className="flex"
                      >
                        <div className="flex items-center space-x-2 w-1/2">
                          <RadioGroupItem
                            value="M"
                            id="buy"
                            className="text-blue-500"
                          />
                          <Label
                            htmlFor="buy"
                            className="text-blue-500 font-semibold"
                          >
                            Mua
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 w-1/2">
                          <RadioGroupItem
                            value="B"
                            id="sell"
                            className="text-red-500"
                          />
                          <Label
                            htmlFor="sell"
                            className="text-red-500 font-semibold"
                          >
                            Bán
                          </Label>
                        </div>
                      </RadioGroup>
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                /> */
}
