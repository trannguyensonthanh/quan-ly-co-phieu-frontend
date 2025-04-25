import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Settings, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserNav } from "@/components/ui/user-nav";
import { NotificationCenter } from "@/components/ui/notification-center";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useLogoutMutation } from "@/queries/auth.queries";

export type HeaderProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const { isAuthenticated, logout, user, isEmployee, isInvestor } = useAuth();
  const { notifications, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  const {
    mutate: logoutMutation,
    isPending: isLogoutPending,
    isError: isLogoutError,
    error: logoutError,
    isSuccess: isLogoutSuccess,
    data: logoutData,
  } = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation();
    if (isLogoutSuccess) {
      logout();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
        scrolled && "shadow-sm"
      )}
    >
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://i.imgur.com/jipFADU.png"
            alt="Logo"
            className="h-[45px] w-[150px]"
          />
          {/* <img
            src="https://i.imgur.com/jipFADU.png"
            alt="Logo"
            className="h-[45px] w-[150px]"
          /> */}
        </Link>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="mr-2"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <ArrowLeft className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {isAuthenticated && !isMobile && (
        <div className="ml-4 flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Giao dịch</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          to="/price-board"
                          style={{
                            backgroundImage:
                              "url('https://i.imgur.com/qJkLiUr.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="mb-2 mt-4 text-xl font-bold text-white">
                            Bảng giá
                          </div>
                          <p className="text-sm leading-tight text-white font-bold">
                            Xem bảng giá cổ phiếu trực tuyến
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/stocks"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Danh sách cổ phiếu
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Xem tất cả cổ phiếu đang giao dịch
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {isInvestor && (
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/trading"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Đặt lệnh
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Đặt lệnh mua/bán cổ phiếu
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    )}
                    {isInvestor && (
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/portfolio"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Danh mục đầu tư
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Quản lý danh mục đầu tư của bạn
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Báo cáo</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/balance"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Số dư tài khoản
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Kiểm tra số dư tài khoản của bạn
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/order-history"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Lịch sử đặt lệnh
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Xem lịch sử đặt lệnh của bạn
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/transaction-history"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Lịch sử khớp lệnh
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Xem lịch sử khớp lệnh của bạn
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/reports/stock-orders"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Sao kê lệnh đặt
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Xem sao kê lệnh đặt
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {isEmployee && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Quản trị</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/admin/users"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Quản lý người dùng
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Thêm, sửa, xóa tài khoản người dùng
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/admin/investors"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Quản lý nhà đầu tư
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Quản lý thông tin nhà đầu tư
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/admin/stocks"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Quản lý cổ phiếu
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Thêm, sửa, xóa thông tin cổ phiếu
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/admin/funds"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Quản lý tiền
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Nạp/rút tiền cho nhà đầu tư
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/admin/backup"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Sao lưu dữ liệu
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Sao lưu và khôi phục dữ liệu
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem>
                <Link to="/settings" className={navigationMenuTriggerStyle()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}

      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onClearAll={clearAll}
          />
        )}
        <ModeToggle />

        {isAuthenticated ? (
          <UserNav user={user} onLogout={handleLogout} />
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Đăng ký</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
