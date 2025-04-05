
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/utils/types';
import { authenticateUser } from '@/utils/mock-data';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isEmployee: boolean;
  isInvestor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Authenticate user (in a real app, this would be an API call)
      const authenticatedUser = authenticateUser(username, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        
        toast({
          title: "Đăng nhập thành công",
          description: `Xin chào, ${authenticatedUser.fullName}`,
        });
        
        return true;
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Lỗi đăng nhập",
        description: "Đã xảy ra lỗi trong quá trình đăng nhập",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    navigate('/login');
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi hệ thống"
    });
  };

  const isEmployee = user?.role === 'employee';
  const isInvestor = user?.role === 'investor';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isEmployee, isInvestor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
