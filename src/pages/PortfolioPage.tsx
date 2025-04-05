
import Portfolio from "@/components/portfolio/Portfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PortfolioPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Danh mục đầu tư</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh mục cổ phiếu</CardTitle>
          <CardDescription>
            Theo dõi và quản lý danh mục đầu tư của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Portfolio />
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioPage;
