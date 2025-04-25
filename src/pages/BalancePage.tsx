import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  mockBankAccounts,
  mockStockOwnerships,
  mockStocks,
  mockUsers,
} from "@/utils/mock-data";
import { useAuth } from "@/context/AuthContext";
import {
  useGetMyBalancesQuery,
  useGetMyPortfolioQuery,
} from "@/queries/portfolio.queries";

const BalancePage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("money");
  const { data: bankBalances, isLoading: isLoadingBalances } =
    useGetMyBalancesQuery();
  console.log("bankBalances", bankBalances);
  const { data: portfolio, isLoading: isLoadingPortfolio } =
    useGetMyPortfolioQuery();

  // Get user's stock ownerships
  const userStocks = user
    ? mockStockOwnerships
        .filter((ownership) => ownership.userId === user.id)
        .map((ownership) => {
          const stock = mockStocks.find((s) => s.MaCP === ownership.stockCode);
          return {
            ...ownership,
            TenCty: stock?.TenCty || "",
            GiaKhopCuoi: stock?.GiaKhopCuoi || 0,
            totalValue: ownership.quantity * (stock?.GiaKhopCuoi || 0),
          };
        })
    : [];

  // Calculate total value
  const totalStock = portfolio?.reduce((sum, stock) => sum + stock.SoLuong, 0);
  const totalCashValue = bankBalances?.reduce(
    (sum, account) => sum + account.SoTien,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tra cứu số dư</h1>

      <Card>
        <CardHeader>
          <CardTitle>Số dư tài khoản</CardTitle>
          <CardDescription>
            Thông tin số dư tiền và cổ phiếu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Tổng giá trị tiền mặt
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {new Intl.NumberFormat("vi-VN").format(totalCashValue)} VNĐ
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Tổng số lượng cổ phiếu
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {new Intl.NumberFormat("vi-VN").format(totalStock)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="bg-purple-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Tổng tài sản
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {new Intl.NumberFormat("vi-VN").format(totalAssetValue)} VNĐ
                  </p>
                </div>
              </CardContent>
            </Card> */}
          </div>

          <Tabs
            defaultValue="money"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="money">Tiền mặt</TabsTrigger>
              <TabsTrigger value="stocks">Cổ phiếu</TabsTrigger>
            </TabsList>

            <TabsContent value="money">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã tài khoản</TableHead>
                    <TableHead>Ngân hàng</TableHead>
                    <TableHead className="text-right">Tên ngân hàng</TableHead>
                    <TableHead className="text-right">Số dư</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankBalances?.map((account) => {
                    return (
                      <TableRow key={account.MaTK.trim()}>
                        <TableCell className="font-medium">
                          {account.MaTK.trim()}
                        </TableCell>
                        <TableCell>{account.MaNH.trim()}</TableCell>
                        <TableCell className="text-right">
                          {account.TenNH?.trim() || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("vi-VN").format(
                            account.SoTien
                          )}{" "}
                          VNĐ
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {bankBalances?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-6"
                      >
                        Không có tài khoản nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="stocks">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã CP</TableHead>
                    <TableHead>Tên công ty</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    {/* <TableHead className="text-right">Giá hiện tại</TableHead>
                    <TableHead className="text-right">Tổng giá trị</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio?.map((stock) => (
                    <TableRow key={stock.MaCP}>
                      <TableCell className="font-medium">
                        {stock.MaCP}
                      </TableCell>
                      <TableCell>{stock.TenCty}</TableCell>
                      <TableCell className="text-right">
                        {stock.SoLuong.toLocaleString()}
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {stock.GiaKhopCuoi.toLocaleString()} VNĐ
                      </TableCell>
                      <TableCell className="text-right">
                        {stock.totalValue.toLocaleString()} VNĐ
                      </TableCell> */}
                    </TableRow>
                  ))}
                  {userStocks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-6"
                      >
                        Không có cổ phiếu nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalancePage;
