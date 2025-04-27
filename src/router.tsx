import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";

import { Route, Routes } from "react-router-dom";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import MainLayout from "@/components/layout/MainLayout";
import StocksPage from "@/pages/StocksPage";
import StockDetailPage from "@/pages/StockDetailPage";
import PriceBoardPage from "@/pages/PriceBoardPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import PortfolioPage from "@/pages/PortfolioPage";
import TradingPage from "@/pages/TradingPage";
import MoneyTransactionReportPage from "@/pages/MoneyTransactionReportPage";
import StockOrderReportPage from "@/pages/StockOrderReportPage";
import MatchedOrdersPage from "@/pages/MatchedOrdersPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import BalancePage from "@/pages/BalancePage";
import UserManagementPage from "@/pages/UserManagementPage";
import BankManagementPage from "@/pages/BankManagementPage";
import StockManagementPage from "@/pages/StockManagementPage";
import FundManagementPage from "@/pages/FundManagementPage";
import DatabaseBackupPage from "@/pages/DatabaseBackupPage";
import PasswordChangePage from "./pages/PasswordChangePage";
import NotFound from "@/pages/NotFound";
import StockAllocationPage from "@/pages/StockAllocationPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

export default function MyRouter() {
  return (
    <>
      <Routes>
        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<MainLayout />}>
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/price-board" element={<PriceBoardPage />} />

          {/* Protected routes for all authenticated users */}
          <Route
            element={<ProtectedRoute allowedRoles={["NhaDauTu", "NhanVien"]} />}
          >
            <Route path="/" element={<Index />} />
            <Route path="/stocks/:stockCode" element={<StockDetailPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Protected routes for investor users only */}
          <Route element={<ProtectedRoute allowedRoles={["NhaDauTu"]} />}>
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/trading" element={<TradingPage />} />

            <Route
              path="/transaction-history"
              element={<MatchedOrdersPage />}
            />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/balance" element={<BalancePage />} />
          </Route>

          {/* Protected routes for employee users only */}
          <Route element={<ProtectedRoute allowedRoles={["NhanVien"]} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/banks" element={<BankManagementPage />} />
            <Route path="/admin/stocks" element={<StockManagementPage />} />
            <Route path="/admin/funds" element={<FundManagementPage />} />
            <Route path="/admin/backup" element={<DatabaseBackupPage />} />
            <Route
              path="/admin/change-password"
              element={<PasswordChangePage />}
            />
            {/* Add the new route for StockAllocationPage */}
            <Route path="/stock-allocation" element={<StockAllocationPage />} />
            <Route
              path="/reports/money-transactions"
              element={<MoneyTransactionReportPage />}
            />
            <Route
              path="/reports/stock-orders"
              element={<StockOrderReportPage />}
            />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
