import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Home,
  LineChart,
  PieChart,
  ShoppingBag,
  User,
  FileText,
  Settings,
  DollarSign,
  CreditCard,
  Clock,
  FileBarChart,
  Database,
  UserPlus,
  Wallet,
  Landmark,
  Building,
  Key,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { isEmployee, isInvestor } = useAuth();

  const menuItems = [
    { title: "Trang chủ", icon: <Home className="h-5 w-5" />, path: "/" },
    {
      title: "Danh sách cổ phiếu",
      icon: <Landmark className="h-5 w-5" />,
      path: "/stocks",
    },
    {
      title: "Bảng giá",
      icon: <BarChart className="h-5 w-5" />,
      path: "/price-board",
    },
    ...(isInvestor
      ? [
          {
            title: "Danh mục đầu tư",
            icon: <PieChart className="h-5 w-5" />,
            path: "/portfolio",
          },
          {
            title: "Đặt lệnh",
            icon: <ShoppingBag className="h-5 w-5" />,
            path: "/trading",
          },
          {
            title: "Tra cứu số dư",
            icon: <DollarSign className="h-5 w-5" />,
            path: "/balance",
          },
          {
            title: "Sao kê giao dịch lệnh",
            icon: <FileText className="h-5 w-5" />,
            path: "/order-history",
          },
          {
            title: "Sao kê lệnh khớp",
            icon: <CreditCard className="h-5 w-5" />,
            path: "/transaction-history",
          },
          {
            title: "Tài khoản",
            icon: <User className="h-5 w-5" />,
            path: "/profile",
          },
          {
            title: "Cài đặt",
            icon: <Settings className="h-5 w-5" />,
            path: "/settings",
          },
        ]
      : []),
    ...(isEmployee
      ? [
          {
            title: "Quản lý tài khoản",
            icon: <UserPlus className="h-5 w-5" />,
            path: "/admin/users",
          },
          {
            title: "Quản lý ngân hàng",
            icon: <Building className="h-5 w-5" />,
            path: "/admin/banks",
          },
          {
            title: "Quản lý cổ phiếu",
            icon: <LineChart className="h-5 w-5" />,
            path: "/admin/stocks",
          },
          {
            title: "Quản lý tiền",
            icon: <Wallet className="h-5 w-5" />,
            path: "/admin/funds",
          },
          {
            title: "Sao kê giao dịch tiền",
            icon: <FileBarChart className="h-5 w-5" />,
            path: "/reports/money-transactions",
          },
          {
            title: "Sao kê lệnh đặt",
            icon: <Clock className="h-5 w-5" />,
            path: "/reports/stock-orders",
          },
          {
            title: "Sao lưu dữ liệu",
            icon: <Database className="h-5 w-5" />,
            path: "/admin/backup",
          },
          {
            title: "Đổi mật khẩu",
            icon: <Key className="h-5 w-5" />,
            path: "/admin/change-password",
          },
          {
            title: "Tài khoản",
            icon: <User className="h-5 w-5" />,
            path: "/profile",
          },
          {
            title: "Cài đặt",
            icon: <Settings className="h-5 w-5" />,
            path: "/settings",
          },
        ]
      : []),
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pb-4 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 md:w-20"
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        {isOpen ? (
          <span className="text-xl font-bold text-primary">Hanoi Stock</span>
        ) : (
          <span className="text-xl font-bold text-primary hidden md:block">
            HS
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4">
          {menuItems.map((item) => (
            <li key={item.path} className="px-2 py-1">
              <Link
                to={item.path}
                className={cn(
                  "flex items-center p-2 rounded-md transition-colors duration-200",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  !isOpen && "justify-center md:justify-center"
                )}
              >
                {item.icon}
                {isOpen && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 px-4">
        <div
          className={cn(
            "text-xs text-gray-500 dark:text-gray-400",
            !isOpen && "hidden md:text-center"
          )}
        >
          {isOpen ? (
            <div>
              <p>Hanoi Stock Trader</p>
              <p>© 2025 All rights reserved</p>
            </div>
          ) : (
            <p className="hidden md:block">HSE</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
