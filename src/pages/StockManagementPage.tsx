/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStockManagement } from "@/hooks/useStockManagement";
import { StockFormDialog } from "@/components/stocks/StockFormDialog";
import { ListingDialog } from "@/components/stocks/ListingDialog";
import { StockListHeader } from "@/components/stocks/StockListHeader";
import { StockTable } from "@/components/stocks/StockTable";
import { useToast } from "@/hooks/use-toast";
import { Stock } from "@/utils/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CoPhieu } from "@/services/stock.service";
import {
  useCreateStockMutation,
  useDeleteStockMutation,
  useDelistStockMutation,
  useGetAllUndoLogsQuery,
  useListStockMutation,
  useUpdateStockMutation,
} from "@/queries/stock.queries";
import { OrderAutoControl } from "@/components/stocks/OrderAutoControl";
import { useState } from "react";
import {
  useGetMarketStatusQuery,
  usePrepareNextDayPricesMutation,
  useRelistStockMutation,
  useSetMarketModeAutoMutation,
  useSetMarketModeManualMutation,
  useTriggerATCMutation,
  useTriggerATOMutation,
  useTriggerContinuousMutation,
} from "@/queries/admin.queries";
import { Clock, AlertCircle, Settings2, Layers, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
const StockManagementPage = () => {
  const { toast } = useToast();
  const {
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
  } = useStockManagement();

  const now = new Date();
  // const isTradingHours = now.getHours() >= 8 && now.getHours() < 15; // ch cân thiết vì đang demo
  const isTradingHours = false;
  const [autoTrading, setAutoTrading] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string>();
  const createStockMutation = useCreateStockMutation(); // Tạo cổ phiếu mới
  const updateStockMutation = useUpdateStockMutation(); // Cập nhật cổ phiếu
  const deleteStockMutation = useDeleteStockMutation(); // Xóa cổ phiếu
  const delistStockMutation = useDelistStockMutation(); // Ngừng giao dịch cổ phiếu
  const listStockMutation = useListStockMutation(); // Niêm yết cổ phiếu
  const prepareNextDayPricesMutation = usePrepareNextDayPricesMutation(); // Chuẩn bị dữ liệu cho ngày tiếp theo
  const { data: undoLogs, refetch: refetchUndoLogs } = useGetAllUndoLogsQuery(); // lấy tất cả undo cổ phiếu
  const triggerATOMutation = useTriggerATOMutation();
  const triggerContinuousMutation = useTriggerContinuousMutation();
  const triggerATCMutation = useTriggerATCMutation();
  const setMarketModeAutoMutation = useSetMarketModeAutoMutation();
  const setMarketModeManualMutation = useSetMarketModeManualMutation();
  const relistStockMutation = useRelistStockMutation(); // Mở giao dịch cổ phiếu
  const navigate = useNavigate();
  const {
    data: marketStatus,
    isLoading: isMarketStatusLoading,
    refetch: refetchMarketStatus,
  } = useGetMarketStatusQuery();

  if (marketStatus?.operatingMode === "AUTO" && !autoTrading) {
    setAutoTrading(true);
  } else if (marketStatus?.operatingMode === "MANUAL" && autoTrading) {
    setAutoTrading(false);
  }

  // --- Các hàm render Loading/Error (giữ nguyên) ---
  const renderLoading = () => (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span>Đang tải trạng thái...</span>
    </div>
  );

  const renderError = () => (
    <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>Lỗi tải trạng thái</span>
    </div>
  );
  // --- ---

  // --- Hàm render trạng thái chính ---
  const renderStatus = (status) => {
    const { operatingMode, sessionState } = status;

    // --- Định nghĩa màu sắc và text ---
    const modeStyle =
      operatingMode === "AUTO"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

    const sessionTextMap = {
      PREOPEN: "Trước mở cửa", // Hoặc "Phiên trước mở cửa"
      ATO: "ATO", // "Khớp lệnh định kỳ mở cửa" hơi dài
      CONTINUOUS: "Liên tục", // "Khớp lệnh liên tục"
      ATC: "ATC", // "Khớp lệnh định kỳ đóng cửa"
      CLOSED: "Đóng cửa",
      // Thêm các trạng thái khác nếu có thể xảy ra
    };
    const sessionDisplay = sessionTextMap[sessionState] || sessionState; // Fallback

    const sessionStyleMap = {
      PREOPEN: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200", // Màu khác cho preopen
      ATO: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", // Màu cho ATO
      CONTINUOUS:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", // Màu cho liên tục
      ATC: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", // Màu cho ATC
      CLOSED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", // Màu cho đóng cửa
    };
    const sessionStyle =
      sessionStyleMap[sessionState] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"; // Fallback style
    // --- ---

    return (
      // Container chính cho các trạng thái, căn chỉnh baseline để label và badge thẳng hàng đẹp hơn
      // Thêm gap lớn hơn giữa các cụm trạng thái
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        {/* Cụm Chế độ vận hành */}
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          <Settings2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 relative top-0.5" />{" "}
          {/* Căn chỉnh icon với text */}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Chế độ:
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${modeStyle}`}
            title={operatingMode} // Hiển thị tooltip mã gốc
          >
            {operatingMode === "AUTO" ? "Tự động" : "Thủ công"}
          </span>
          {/* Không cần hiển thị mã gốc ở đây vì chỉ có 2 trạng thái */}
        </div>

        {/* Cụm Trạng thái phiên */}
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          <Layers className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 relative top-0.5" />{" "}
          {/* Icon khác và căn chỉnh */}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Trạng thái phiên:
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sessionStyle}`}
            title={sessionState} // Hiển thị tooltip mã gốc
          >
            {sessionDisplay}
          </span>
          {/* Hiển thị mã gốc nhỏ hơn, màu khác bên cạnh */}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            ({sessionState})
          </span>
        </div>

        {/* Thêm các cụm trạng thái khác ở đây nếu cần */}
      </div>
    );
  };

  // const handleListStock = (stock: Stock) => {
  //   setStockToList(stock);
  //   setShowListingDialog(true);
  // };

  const handleHaltStock = (stock: Stock) => {
    setStockToHalt(stock);
    setShowHaltDialog(true);
  };

  const handleDeleteStock = (stock: Stock) => {
    if (stock.Status !== 0) {
      toast({
        title: "Không thể xóa",
        description: "Không thể xóa cổ phiếu đã từng giao dịch trên sàn",
        variant: "destructive",
      });
      return;
    }
    setStockToDelete(stock);
    setShowDeleteDialog(true);
  };

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setShowDialog(true);
  };

  const handleResumeStock = async (stock: Stock) => {
    try {
      console.log(stock);
      await relistStockMutation.mutateAsync(
        { maCP: stock.MaCP, giaTC: stock.GiaTC || 0 },
        {
          onSuccess: () => {
            const updatedStocks = stocks.map((s) => {
              if (s.MaCP === stock.MaCP) {
                return { ...s, Status: 1 };
              }
              return s;
            });

            saveToHistory(updatedStocks);
            setStocks(updatedStocks);

            toast({
              title: "Mở giao dịch cổ phiếu thành công",
              description: `Đã mở giao dịch cổ phiếu ${stock.MaCP}`,
            });
          },
          onError: (error) => {
            toast({
              title: "Lỗi",
              description:
                error.message ||
                "Không thể mở giao dịch cổ phiếu. Vui lòng thử lại.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Hàm xử lý khi người dùng nhấn nút "Thêm" hoặc "Cập nhật" trong form
  const onStockFormSubmit = async (values: any) => {
    try {
      if (editingStock) {
        await updateStockMutation.mutateAsync(
          {
            maCP: editingStock.MaCP,
            stockData: {
              TenCty: values.TenCty,
              DiaChi: values.DiaChi,
              SoLuongPH: values.SoLuongPH,
            },
          },
          {
            onSuccess: () => {
              const updatedStocks = stocks.map((stock) => {
                if (stock.MaCP === editingStock.MaCP) {
                  return {
                    ...stock,
                    TenCty: values.TenCty,
                    DiaChi: values.DiaChi,
                    SoLuongPH: values.SoLuongPH,
                  };
                }
                return stock;
              });

              saveToHistory(updatedStocks);
              setStocks(updatedStocks);

              toast({
                title: "Cập nhật cổ phiếu thành công",
                description: `Đã cập nhật cổ phiếu ${values.MaCP}`,
              });

              setShowDialog(false);
              setEditingStock(null);
            },
            onError: (err) => {
              toast({
                title: "Lỗi",
                description:
                  err.message ||
                  "Không thể cập nhật cổ phiếu. Vui lòng thử lại.",
                variant: "destructive",
              });
            },
          }
        );
      } else {
        const newStock: CoPhieu = {
          MaCP: values.MaCP.toUpperCase(),
          TenCty: values.TenCty,
          DiaChi: values.DiaChi,
          SoLuongPH: values.SoLuongPH,
          Status: 0,
        };

        await createStockMutation.mutateAsync(newStock, {
          onSuccess: () => {
            const updatedStocks = [...stocks, newStock];
            saveToHistory(updatedStocks);
            setStocks(updatedStocks);

            toast({
              title: "Thêm cổ phiếu thành công",
              description: `Đã thêm cổ phiếu ${newStock.MaCP}`,
            });

            setShowDialog(false);
            setEditingStock(null);
          },
          onError: (err) => {
            toast({
              title: "Lỗi",
              description:
                err.message || "Không thể thêm cổ phiếu. Vui lòng thử lại.",
              variant: "destructive",
            });
          },
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setEditingStock(null);
      setShowDialog(false);
      refetchUndoLogs(); // Tải lại danh sách sao kê lệnh CP
    }
  };

  const confirmDelete = async () => {
    if (!stockToDelete) return;

    try {
      await deleteStockMutation.mutateAsync(
        { maCP: stockToDelete.MaCP },
        {
          onSuccess: () => {
            const filteredStocks = stocks.filter(
              (s) => s.MaCP !== stockToDelete.MaCP
            );
            saveToHistory(filteredStocks);
            setStocks(filteredStocks);

            toast({
              title: "Xóa cổ phiếu thành công",
              description: `Đã xóa cổ phiếu ${stockToDelete.MaCP}`,
            });

            setShowDeleteDialog(false);
            setStockToDelete(null);
          },
          onError: () => {
            toast({
              title: "Lỗi",
              description: "Không thể xóa cổ phiếu. Vui lòng thử lại.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setStockToDelete(null);
      refetchUndoLogs(); // Tải lại danh sách sao kê lệnh CP
    }
  };

  const confirmHalt = async () => {
    if (!stockToHalt) return;

    try {
      await delistStockMutation.mutateAsync(
        { maCP: stockToHalt.MaCP },
        {
          onSuccess: () => {
            const updatedStocks = stocks.map((s) => {
              if (s.MaCP === stockToHalt.MaCP) {
                return { ...s, Status: 2 };
              }
              return s;
            });

            saveToHistory(updatedStocks);
            setStocks(updatedStocks);

            toast({
              title: "Ngừng giao dịch cổ phiếu thành công",
              description: `Đã ngừng giao dịch cổ phiếu ${stockToHalt.MaCP}`,
            });

            setShowHaltDialog(false);
            setStockToHalt(null);
          },
          onError: () => {
            toast({
              title: "Lỗi",
              description:
                "Không thể ngừng giao dịch cổ phiếu. Vui lòng thử lại.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const onListingSubmit = async (values: any) => {
    if (!stockToList) return;
    console.log("Listing stock:", stockToList, values);
    // try {
    //   const GiaTC = values.GiaTC;

    //   await listStockMutation.mutateAsync(
    //     {
    //       maCP: stockToList.MaCP,
    //       initialGiaTC: GiaTC,
    //     },
    //     {
    //       onSuccess: () => {
    //         const newStocks = stocks.map((stock) => {
    //           if (stock.MaCP === stockToList.MaCP) {
    //             return {
    //               ...stock,
    //               Status: 1,
    //               GiaTC,
    //               GiaTran: GiaTC * 1.05,
    //             };
    //           }
    //           return stock;
    //         });

    //         saveToHistory(newStocks);
    //         setStocks(newStocks);

    //         toast({
    //           title: "Niêm yết cổ phiếu thành công",
    //           description: `Đã niêm yết cổ phiếu ${stockToList.MaCP}`,
    //         });

    //         setShowListingDialog(false);
    //         setStockToList(null);
    //       },
    //       onError: (err) => {
    //         toast({
    //           title: "Lỗi",
    //           description:
    //             err.message || "Không thể niêm yết cổ phiếu. Vui lòng thử lại.",
    //           variant: "destructive",
    //         });
    //       },
    //     }
    //   );
    // } catch (error) {
    //   toast({
    //     title: "Lỗi",
    //     description:
    //       error.message || "Không thể thực hiện thao tác. Vui lòng thử lại.",
    //     variant: "destructive",
    //   });
    // }
  };

  const handleCanUndo = (): boolean => {
    if (undoLogs?.length > 0) {
      return true; // Có thể hoàn tác
    }
    return false; // Không thể hoàn tác
  };

  const handleATO = async () => {
    setLoadingKey("ATO");
    try {
      await triggerATOMutation.mutateAsync(undefined, {
        onSuccess: () => {
          toast({
            title: "Khớp lệnh ATO thành công",
            description: "Đã khớp lệnh ATO.",
          });
          refetchMarketStatus();
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || "Không thể khớp lệnh ATO. Vui lòng thử lại.",
            variant: "destructive",
          });
        },
      });
    } finally {
      setLoadingKey(undefined);
    }
  };

  const handleLO = async () => {
    setLoadingKey("LO");
    try {
      await triggerContinuousMutation.mutateAsync(undefined, {
        onSuccess: () => {
          toast({
            title: "Khớp lệnh LO thành công",
            description: "Đã khớp lệnh LO.",
          });
          refetchMarketStatus();
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || "Không thể khớp lệnh LO. Vui lòng thử lại.",
            variant: "destructive",
          });
        },
      });
    } finally {
      setLoadingKey(undefined);
    }
  };

  const handleATC = async () => {
    setLoadingKey("ATC");
    try {
      await triggerATCMutation.mutateAsync(undefined, {
        onSuccess: () => {
          toast({
            title: "Khớp lệnh ATC thành công",
            description: "Đã khớp lệnh ATC.",
          });
          refetchMarketStatus(); // Tải lại trạng thái thị trường sau khi khớp lệnh
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || "Không thể khớp lệnh ATC. Vui lòng thử lại.",
            variant: "destructive",
          });
        },
      });
    } finally {
      setLoadingKey(undefined);
    }
  };

  const handlePrepareNextDay = async () => {
    setLoadingKey("PREPARE");
    try {
      await prepareNextDayPricesMutation.mutateAsync(undefined, {
        onSuccess: () => {
          toast({
            title: "Chuẩn bị dữ liệu hoàn tất",
            description: "Dữ liệu ngày tiếp theo đã sẵn sàng.",
          });
          refetchMarketStatus();
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || "Không thể chuẩn bị dữ liệu. Vui lòng thử lại.",
            variant: "destructive",
          });
        },
      });
    } finally {
      setLoadingKey(undefined);
    }
  };

  const handleAutoControl = async (value: boolean) => {
    setAutoTrading(value);
    try {
      if (value) {
        await setMarketModeAutoMutation.mutateAsync(undefined, {
          onSuccess: () => {
            toast({
              title: "Chế độ tự động đã được kích hoạt",
              description: "Hệ thống sẽ tự động khớp lệnh và chuẩn bị dữ liệu.",
            });
            refetchMarketStatus(); // Tải lại trạng thái thị trường sau khi thay đổi chế độ
          },
          onError: (error) => {
            toast({
              title: "Lỗi",
              description:
                error.message ||
                "Không thể kích hoạt chế độ tự động. Vui lòng thử lại.",
              variant: "destructive",
            });
          },
        });
      } else {
        await setMarketModeManualMutation.mutateAsync(undefined, {
          onSuccess: () => {
            toast({
              title: "Chế độ tự động đã được tắt",
              description: "Hệ thống sẽ chuyển về chế độ thủ công.",
            });
            refetchMarketStatus(); // Tải lại trạng thái thị trường sau khi thay đổi chế độ
          },
          onError: (error) => {
            toast({
              title: "Lỗi",
              description:
                error.message ||
                "Không thể tắt chế độ tự động. Vui lòng thử lại.",
              variant: "destructive",
            });
          },
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Không thể thay đổi chế độ. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateAllocation = (value) => {
    navigate("/stock-allocation", { state: value });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý cổ phiếu</h1>
        <Button
          variant="secondary"
          onClick={() => {
            navigate("/stock-allocation");
          }}
        >
          Phân bổ cổ phiếu
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 max-w-full w-full mx-auto transition-all duration-300">
        {/* Tiêu đề (có thể giữ hoặc bỏ nếu muốn tối giản hơn) */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap pr-2 border-r border-gray-200 dark:border-gray-600 mr-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Trạng thái sàn hiện tại
          </span>
          {/* Rút gọn tiêu đề */}
        </div>

        {/* Phần nội dung trạng thái */}
        <div className="flex-grow min-w-0">
          {" "}
          {/* flex-grow để nội dung chiếm phần còn lại, min-w-0 để xử lý tràn text */}
          {isMarketStatusLoading
            ? renderLoading()
            : !marketStatus
            ? renderError()
            : renderStatus(marketStatus)}
        </div>
      </div>
      <OrderAutoControl
        isAuto={autoTrading}
        onToggleAuto={(value) => handleAutoControl(value)}
        onATO={handleATO}
        onLO={handleLO}
        onATC={handleATC}
        onPrepareNextDay={handlePrepareNextDay}
        isTradingHours={isTradingHours}
        loadingKey={loadingKey}
      />
      <Card>
        <CardHeader>
          <CardTitle>Danh sách cổ phiếu</CardTitle>
          <CardDescription>Quản lý cổ phiếu giao dịch trên sàn</CardDescription>
        </CardHeader>
        <CardContent>
          <StockListHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) =>
              setStatusFilter(value === "all" ? null : Number(value))
            }
            onAddClick={() => setShowDialog(true)}
            onUndo={handleUndo}
            onReload={handleReloadStocks}
            canUndo={handleCanUndo()}
          />

          <StockTable
            stocks={filteredStocks}
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
            // onList={handleListStock}
            onHalt={handleHaltStock}
            onResume={handleResumeStock}
            handleNavigateAllocation={handleNavigateAllocation}
          />
        </CardContent>
      </Card>
      <StockFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={onStockFormSubmit}
        editingStock={editingStock}
        setEditingStock={setEditingStock}
      />
      {/* <ListingDialog
        open={showListingDialog}
        onOpenChange={setShowListingDialog}
        onSubmit={onListingSubmit}
        stock={stockToList}
      /> */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cổ phiếu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cổ phiếu {stockToDelete?.MaCP}? Hành
              động này không thể hoàn tác sau khi đã xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setStockToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showHaltDialog} onOpenChange={setShowHaltDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ngừng giao dịch</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ngừng giao dịch cổ phiếu {stockToHalt?.MaCP}
              ? Hành động này sẽ ảnh hưởng đến các nhà đầu tư đang nắm giữ cổ
              phiếu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowHaltDialog(false);
                setStockToHalt(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmHalt}>
              Ngừng giao dịch
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StockManagementPage;
