
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart, Home, LineChart, PieChart, ShoppingBag, User } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Trang chủ',
      icon: <Home className="h-5 w-5" />,
      path: '/',
    },
    {
      title: 'Danh sách cổ phiếu',
      icon: <BarChart className="h-5 w-5" />,
      path: '/stocks',
    },
    {
      title: 'Danh mục đầu tư',
      icon: <PieChart className="h-5 w-5" />,
      path: '/portfolio',
    },
    {
      title: 'Đặt lệnh',
      icon: <ShoppingBag className="h-5 w-5" />,
      path: '/trading',
    },
    {
      title: 'Tài khoản',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-white border-r border-gray-200 pb-4 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 md:w-20"
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        {isOpen ? (
          <span className="text-xl font-bold text-primary">Hanoi Stock</span>
        ) : (
          <span className="text-xl font-bold text-primary hidden md:block">HS</span>
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
                  location.pathname === item.path ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100",
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
      
      <div className="border-t border-gray-200 pt-4 px-4">
        <div className={cn(
          "text-xs text-gray-500",
          !isOpen && "hidden md:text-center"
        )}>
          {isOpen ? (
            <div>
              <p>Hanoi Stock Exchange</p>
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
