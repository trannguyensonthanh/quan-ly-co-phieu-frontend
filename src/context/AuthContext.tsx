import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/utils/types";
import { authenticateUser } from "@/utils/mock-data";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { SignInData } from "@/services/auth.service";

interface AuthContextType {
  user: SignInData | null;
  login: (userData: SignInData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isEmployee: boolean;
  isInvestor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<SignInData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const storedUser = localStorage.getItem("user");
  // Check for existing session on mount
  useEffect(() => {
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [storedUser]);

  const login = async (userData: SignInData): Promise<boolean> => {
    try {
      // Authenticate user (in a real app, this would be an API call

      setUser(userData);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Lỗi đăng nhập",
        description: "Đã xảy ra lỗi trong quá trình đăng nhập",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi hệ thống",
    });
  };

  const isEmployee = user?.role === "NhanVien";
  const isInvestor = user?.role === "NhaDauTu";

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isEmployee, isInvestor }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
