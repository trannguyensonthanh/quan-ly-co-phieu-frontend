
import { useLocation, Link } from "react-router-dom";
import { 
  ChevronDown, 
  Coins, 
  BarChart, 
  DollarSign, 
  FileText, 
  Home, 
  Settings, 
  ShoppingBag, 
  Users, 
  Database,
  LayoutDashboard,
  CircleDollarSign,
  Landmark
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type NavigationItem = {
  title: string;
  href?: string;
  icon: React.ReactNode;
  submenu?: NavigationItem[];
  roles?: ("investor" | "employee")[];
};

const MainNavigation = () => {
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, isEmployee, isInvestor } = useAuth();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    update: true,
    reporting: false,
    admin: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navigationItems: NavigationItem[] = [
    {
      title: "Trang chủ",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Cập nhật",
      icon: <LayoutDashboard className="h-5 w-5" />,
      submenu: [
        {
          title: "Quản lý nhà đầu tư",
          href: "/admin/investors",
          icon: <Users className="h-5 w-5" />,
          roles: ["employee"],
        },
        {
          title: "Quản lý cổ phiếu",
          href: "/admin/stocks",
          icon: <Coins className="h-5 w-5" />,
          roles: ["employee"],
        },
        {
          title: "Quản lý tiền",
          href: "/admin/funds",
          icon: <CircleDollarSign className="h-5 w-5" />,
          roles: ["employee"],
        },
        {
          title: "Bảng giá",
          href: "/price-board",
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          title: "Danh sách cổ phiếu",
          href: "/stocks",
          icon: <Landmark className="h-5 w-5" />,
        },
        {
          title: "Đặt lệnh",
          href: "/trading",
          icon: <ShoppingBag className="h-5 w-5" />,
          roles: ["investor"],
        },
      ],
    },
    {
      title: "Báo cáo",
      icon: <FileText className="h-5 w-5" />,
      submenu: [
        {
          title: "Số dư tài khoản",
          href: "/balance",
          icon: <DollarSign className="h-5 w-5" />,
        },
        {
          title: "Danh mục đầu tư",
          href: "/portfolio",
          icon: <Coins className="h-5 w-5" />,
          roles: ["investor"],
        },
        {
          title: "Lịch sử đặt lệnh",
          href: "/order-history",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Lịch sử khớp lệnh",
          href: "/transaction-history",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Sao kê lệnh đặt",
          href: "/reports/stock-orders",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Sao kê giao dịch tiền",
          href: "/reports/money-transactions",
          icon: <FileText className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Quản trị",
      icon: <Settings className="h-5 w-5" />,
      roles: ["employee"],
      submenu: [
        {
          title: "Quản lý người dùng",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Sao lưu dữ liệu",
          href: "/admin/backup",
          icon: <Database className="h-5 w-5" />,
        },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  const renderNavigationItems = (items: NavigationItem[]) => {
    return items.map((item) => {
      // Skip items based on role requirements
      if (item.roles) {
        if (isEmployee && !item.roles.includes("employee")) return null;
        if (isInvestor && !item.roles.includes("investor")) return null;
      }

      // Handle items with submenus
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter((subItem) => {
          if (subItem.roles) {
            if (isEmployee && !subItem.roles.includes("employee")) return false;
            if (isInvestor && !subItem.roles.includes("investor")) return false;
          }
          return true;
        });

        // Don't render the item if all subitems are filtered out
        if (filteredSubmenu.length === 0) return null;

        return (
          <div key={item.title} className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-between font-medium"
              onClick={() => toggleMenu(item.title.toLowerCase())}
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  openMenus[item.title.toLowerCase()] && "rotate-180"
                )}
              />
            </Button>

            {openMenus[item.title.toLowerCase()] && (
              <div className="pl-6 space-y-1">
                {filteredSubmenu.map((subItem) => (
                  <Button
                    key={subItem.title}
                    variant={isActive(subItem.href!) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive(subItem.href!) && "bg-muted"
                    )}
                    asChild
                  >
                    <Link to={subItem.href!}>
                      {subItem.icon}
                      <span className="ml-2">{subItem.title}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Handle regular items with direct links
      return (
        <Button
          key={item.title}
          variant={isActive(item.href!) ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            isActive(item.href!) && "bg-muted"
          )}
          asChild
        >
          <Link to={item.href!}>
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        </Button>
      );
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col space-y-1 py-2">
      {renderNavigationItems(navigationItems)}
    </div>
  );
};

export default MainNavigation;
