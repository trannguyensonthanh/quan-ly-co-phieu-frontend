
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
