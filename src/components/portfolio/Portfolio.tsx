/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserPortfolio } from "@/utils/mock-data";
import {
  formatCurrency,
  formatNumber,
  getPriceChangeClass,
} from "@/utils/format";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useGetMyPortfolioQuery } from "@/queries/portfolio.queries";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const { data: portfolioData, isLoading } = useGetMyPortfolioQuery();

  useEffect(() => {
    if (portfolioData) {
      setPortfolio(portfolioData);
      const total = portfolioData.reduce(
        (sum, item) => sum + item.SoLuong * item.GiaKhopCuoi,
        0
      );
      setTotalValue(total);
    }
  }, [portfolioData]);

  // Calculate percentage of total value for each stock
  const calculatePercentage = (value: number) => {
    if (totalValue === 0) return 0;
    return (value / totalValue) * 100;
  };

  // Prepare data for pie chart
  const pieChartData = portfolio.map((item) => ({
    name: item.MaCP,
    value: item.SoLuong * item.GiaKhopCuoi,
  }));

  // Colors for pie chart
  const COLORS = [
    "#1890FF",
    "#36CBCB",
    "#4ECB73",
    "#FBD437",
    "#F2637B",
    "#975FE4",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Danh mục đầu tư</CardTitle>
            <CardDescription>Danh sách cổ phiếu đang sở hữu</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã CP</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá hiện tại</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Tổng giá trị
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Tỷ trọng
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((item) => (
                  <TableRow key={item.MaCP}>
                    <TableCell className="font-medium">{item.MaCP}</TableCell>
                    <TableCell>{formatNumber(item.SoLuong)}</TableCell>
                    <TableCell>{formatCurrency(item.GiaKhopCuoi)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(item.SoLuong * item.GiaKhopCuoi)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={calculatePercentage(
                            item.SoLuong * item.GiaKhopCuoi
                          )}
                          className="h-2"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {calculatePercentage(
                            item.SoLuong * item.GiaKhopCuoi
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {portfolio?.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                Chưa có cổ phiếu nào trong danh mục
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu danh mục</CardTitle>
            <CardDescription>
              Tỷ trọng các mã cổ phiếu trong danh mục
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Giá trị",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Không có dữ liệu để hiển thị
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tổng giá trị danh mục:
                </span>
                <span className="font-bold">{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
