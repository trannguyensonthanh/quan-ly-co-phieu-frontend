import { useEffect, useState } from "react";
import { Stock } from "@/utils/types";
import { mockStocks } from "@/utils/mock-data";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAllStocksForAdminQuery,
  useGetAllUndoLogsQuery,
  useUndoLastActionMutation,
} from "@/queries/stock.queries";

export const useStockManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [stockHistory, setStockHistory] = useState<Stock[][]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [stockToList, setStockToList] = useState<Stock | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);
  const [showHaltDialog, setShowHaltDialog] = useState(false);
  const [stockToHalt, setStockToHalt] = useState<Stock | null>(null);

  const {
    data: allStocksForAdmin,
    isLoading: isLoadingAllStocksForAdmin,
    refetch,
  } = useGetAllStocksForAdminQuery();
  const { mutate: undoLastAction } = useUndoLastActionMutation();
  const { refetch: refetchUndoLogs } = useGetAllUndoLogsQuery(false);
  useEffect(() => {
    if (allStocksForAdmin) {
      setStocks(allStocksForAdmin);
      setStockHistory([allStocksForAdmin]);
      setCurrentHistoryIndex(0);
    }
  }, [allStocksForAdmin]);

  const handleReloadStocks = () => {
    refetchUndoLogs();
    refetch();
    if (allStocksForAdmin) {
      setStocks(allStocksForAdmin);
      setStockHistory([allStocksForAdmin]);
      setCurrentHistoryIndex(0);
      console.log("Reloaded stocks:", allStocksForAdmin);
      toast({
        title: "Tải danh sách cổ phiếu thành công",
        description: "Danh sách cổ phiếu đã được tải từ hệ thống",
      });
    } else {
      toast({
        title: "Không thể tải danh sách cổ phiếu",
        description: "Đã xảy ra lỗi khi tải danh sách cổ phiếu",
        variant: "destructive",
      });
    }
  };

  const saveToHistory = (newStocks: Stock[]) => {
    if (currentHistoryIndex < stockHistory.length - 1) {
      setStockHistory((prev) => prev.slice(0, currentHistoryIndex + 1));
    }
    setStockHistory((prev) => [...prev, newStocks]);
    setCurrentHistoryIndex((prev) => prev + 1);
  };
  const handleUndo = () => {
    undoLastAction(undefined, {
      onSuccess: () => {
        toast({
          title: "Hoàn tác thành công",
          description: "Đã hoàn tác thao tác trước đó",
        });
      },
      onError: (error) => {
        toast({
          title: "Không thể hoàn tác",
          description: error?.message || "Đã xảy ra lỗi khi hoàn tác",
          variant: "destructive",
        });
      },
    });
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.MaCP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.TenCty.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === null) {
      return matchesSearch;
    } else {
      return matchesSearch && stock.Status === statusFilter;
    }
  });

  return {
    searchTerm,
    setSearchTerm,
    stocks,
    setStocks,
    editingStock,
    setEditingStock,
    showDialog,
    setShowDialog,
    statusFilter,
    setStatusFilter,
    showListingDialog,
    setShowListingDialog,
    stockToList,
    setStockToList,
    showDeleteDialog,
    setShowDeleteDialog,
    stockToDelete,
    setStockToDelete,
    showHaltDialog,
    setShowHaltDialog,
    stockToHalt,
    setStockToHalt,
    filteredStocks,
    saveToHistory,
    handleUndo,
    handleReloadStocks,
    currentHistoryIndex,
  };
};
