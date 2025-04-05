
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// Layout
import MainLayout from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Main application */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/stocks/:stockCode" element={<StockDetailPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/price-board" element={<PriceBoardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            
            {/* Update section */}
            <Route path="/update/stocks" element={<div>Cập nhật cổ phiếu (Coming Soon)</div>} />
            <Route path="/update/investors" element={<div>Cập nhật nhà đầu tư (Coming Soon)</div>} />
            <Route path="/balance" element={<div>Tra cứu số dư (Coming Soon)</div>} />
            <Route path="/order-history" element={<div>Sao kê giao dịch lệnh (Coming Soon)</div>} />
            <Route path="/transaction-history" element={<div>Sao kê lệnh khớp (Coming Soon)</div>} />
            
            {/* Reports section */}
            <Route path="/reports/stock-orders" element={<div>Sao kê lệnh đặt (Coming Soon)</div>} />
            <Route path="/reports/money-transactions" element={<div>Sao kê giao dịch tiền (Coming Soon)</div>} />
            
            {/* Admin section */}
            <Route path="/admin/users" element={<div>Quản lý tài khoản (Coming Soon)</div>} />
            <Route path="/admin/backup" element={<div>Sao lưu dữ liệu (Coming Soon)</div>} />
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
