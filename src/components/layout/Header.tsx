
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserNav } from "@/components/ui/user-nav";
import { NotificationCenter } from "@/components/ui/notification-center";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type HeaderProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const { isAuthenticated, logout, user } = useAuth();
  const { notifications, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      <Button
        variant="outline"
        size="icon"
        className="mr-2 md:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
          <span className="hidden font-bold md:inline-block">
            Hanoi Stock Exchange
          </span>
        </Link>
      </div>
      
      <div className="flex-1" />
      
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
