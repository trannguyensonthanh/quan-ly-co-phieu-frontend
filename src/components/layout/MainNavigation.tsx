
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart, 
  Users, 
  DollarSign, 
  FileText, 
  PieChart, 
  ShoppingBag, 
  Settings,
  Home,
  UserPlus,
  Database,
  LineChart,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';

// Will be replaced with actual authentication status
const isAdmin = true; // For demo purposes, this will be replaced with actual auth
const isInvestor = false; // For demo purposes

const MainNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <NavigationMenu className="mx-auto max-w-none w-full justify-start">
      <NavigationMenuList className="space-x-1">
        <NavigationMenuItem>
          <Link to="/">
            <Button variant="ghost" className={cn(
              "text-base font-medium",
              isActive('/') && "bg-primary/10 text-primary"
            )}>
              <Home className="mr-2 h-5 w-5" />
              Trang chủ
            </Button>
          </Link>
        </NavigationMenuItem>

        {/* Cập nhật Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-base">
            <FileText className="mr-2 h-5 w-5" />
            Cập nhật
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
              {isAdmin && (
                <>
                  <NavigationMenuLink asChild>
                    <Link to="/update/stocks" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">Cập nhật cổ phiếu</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thêm, Xóa, Ghi, Phục hồi, Reload, Tìm kiếm
                      </p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/update/investors" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">Cập nhật nhà đầu tư</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Quản lý thông tin nhà đầu tư và tài khoản ngân hàng
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </>
              )}
              <NavigationMenuLink asChild>
                <Link to="/balance" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Tra cứu số dư</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Xem số dư tiền và cổ phiếu
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/order-history" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Sao kê giao dịch lệnh</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Xem các giao dịch trong khoảng thời gian
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/transaction-history" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Sao kê lệnh khớp</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Xem các lệnh khớp đã giao dịch thành công
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/price-board" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Bảng giá</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Theo dõi giá và khối lượng giao dịch
                  </p>
                </Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Trading Menu */}
        {isInvestor && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-base">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Đặt lệnh
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[400px] gap-2 p-4">
                <NavigationMenuLink asChild>
                  <Link to="/trading" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Đặt lệnh mua - bán</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Đặt lệnh mua hoặc bán cổ phiếu
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Reports Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-base">
            <BarChart className="mr-2 h-5 w-5" />
            Liệt kê - Thống kê
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-2 p-4">
              <NavigationMenuLink asChild>
                <Link to="/reports/stock-orders" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Sao kê lệnh đặt</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Danh sách lệnh đặt của 1 mã cổ phiếu trong khoảng thời gian
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/reports/money-transactions" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Sao kê giao dịch tiền</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Giao dịch tiền của nhà đầu tư trong khoảng thời gian
                  </p>
                </Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Admin Menu */}
        {isAdmin && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-base">
              <Settings className="mr-2 h-5 w-5" />
              Quản trị
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
                <NavigationMenuLink asChild>
                  <Link to="/admin/users" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Quản lý tài khoản</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Tạo/xóa login cho nhân viên và nhà đầu tư
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/admin/backup" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Sao lưu dữ liệu</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Backup/restore cơ sở dữ liệu
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Direct links to major features */}
        <NavigationMenuItem>
          <Link to="/stocks">
            <Button variant="ghost" className={cn(
              "text-base font-medium",
              isActive('/stocks') && "bg-primary/10 text-primary"
            )}>
              <LineChart className="mr-2 h-5 w-5" />
              Danh sách cổ phiếu
            </Button>
          </Link>
        </NavigationMenuItem>

        {isInvestor && (
          <NavigationMenuItem>
            <Link to="/portfolio">
              <Button variant="ghost" className={cn(
                "text-base font-medium",
                isActive('/portfolio') && "bg-primary/10 text-primary"
              )}>
                <PieChart className="mr-2 h-5 w-5" />
                Danh mục đầu tư
              </Button>
            </Link>
          </NavigationMenuItem>
        )}

        {isInvestor && (
          <NavigationMenuItem>
            <Link to="/trading">
              <Button variant="ghost" className={cn(
                "text-base font-medium",
                isActive('/trading') && "bg-primary/10 text-primary"
              )}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Đặt lệnh
              </Button>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
