
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Index from "./pages/Index";
import StocksPage from "./pages/StocksPage";
import StockDetailPage from "./pages/StockDetailPage";
import TradingPage from "./pages/TradingPage";
import ProfilePage from "./pages/ProfilePage";
import PortfolioPage from "./pages/PortfolioPage";
import PriceBoardPage from "./pages/PriceBoardPage";
import NotFound from "./pages/NotFound";
import BalancePage from "./pages/BalancePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import MatchedOrdersPage from "./pages/MatchedOrdersPage";
import StockOrderReportPage from "./pages/StockOrderReportPage";
import MoneyTransactionReportPage from "./pages/MoneyTransactionReportPage";
import UserManagementPage from "./pages/UserManagementPage";
import DatabaseBackupPage from "./pages/DatabaseBackupPage";

// Layout
import MainLayout from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes for all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/stocks" element={<StocksPage />} />
                <Route path="/stocks/:stockCode" element={<StockDetailPage />} />
                <Route path="/price-board" element={<PriceBoardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/balance" element={<BalancePage />} />
                <Route path="/order-history" element={<OrderHistoryPage />} />
                <Route path="/transaction-history" element={<MatchedOrdersPage />} />
                <Route path="/reports/stock-orders" element={<StockOrderReportPage />} />
                <Route path="/reports/money-transactions" element={<MoneyTransactionReportPage />} />
              </Route>
            </Route>
            
            {/* Protected routes for investor users only */}
            <Route element={<ProtectedRoute allowedRoles={['investor']} />}>
              <Route element={<MainLayout />}>
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/trading" element={<TradingPage />} />
              </Route>
            </Route>
            
            {/* Protected routes for employee users only */}
            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/backup" element={<DatabaseBackupPage />} />
                <Route path="/update/stocks" element={<div>Cập nhật cổ phiếu (Coming Soon)</div>} />
                <Route path="/update/investors" element={<div>Cập nhật nhà đầu tư (Coming Soon)</div>} />
              </Route>
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
