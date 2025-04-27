/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stock } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useGetAllInvestorsQuery } from "@/queries/investor.queries";
import {
  useDistributeStockMutation,
  useRevokeInvestorDistributionMutation,
  useUpdateInvestorDistributionMutation,
} from "@/queries/admin.queries";
import { useGetInvestorBankAccountsQuery } from "@/queries/investor.queries";
import {
  useGetShareholdersQuery,
  useGetTotalDistributedQuantityQuery,
  useListStockMutation,
} from "@/queries/stock.queries";
import { ListingDialog } from "@/components/stocks/ListingDialog";
import EditAllocationForm from "@/components/stocks/EditAllocationForm";

// Schema validation với zod
const allocationSchema = z.object({
  MaNDT: z.string().min(1, "Vui lòng chọn nhà đầu tư"),
  MaTK: z.string().min(1, "Vui lòng chọn tài khoản ngân hàng"),
  SoLuong: z
    .number()
    .min(1, "Số lượng phải lớn hơn 0")
    .refine((val) => val % 100 === 0, {
      message: "Số lượng phải là bội số của 100",
    }),
  GiaPhanBo: z.number().optional(),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

interface StockAllocationFormProps {
  stocks: Stock[];
  stockDetail: any; // Thay đổi kiểu dữ liệu nếu cần
  setShowListingDialog: (show: boolean) => void;
  stockToList: Stock | null;
  showListingDialog: any;
}

const StockAllocationForm = ({
  stocks,
  stockDetail,
  setShowListingDialog,
  stockToList,
  showListingDialog,
}: StockAllocationFormProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<any | null>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [dataAllocations, setDataAllocations] = useState<any>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<any | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState<any | null>(
    null
  );

  const { data: allInvestors } = useGetAllInvestorsQuery();
  const { mutate: distributeStock } = useDistributeStockMutation();
  const { mutate: updateInvestorDistribution } =
    useUpdateInvestorDistributionMutation();
  const { mutate: revokeInvestorDistribution } =
    useRevokeInvestorDistributionMutation();
  const listStockMutation = useListStockMutation(); // Niêm yết cổ phiếu
  const { data: shareholders } = useGetShareholdersQuery(selectedStock?.MaCP);
  const { data: totalDistributedData, refetch: refetchTotalDistributedData } =
    useGetTotalDistributedQuantityQuery(selectedStock?.MaCP);

  useEffect(() => {
    if (shareholders) {
      const updatedShareholders = shareholders.map((shareholder) => ({
        ...shareholder,
        status: "Đã phân bổ",
      }));
      setDataAllocations(updatedShareholders);
    }
  }, [shareholders]);

  useEffect(() => {
    if (allocations) {
      const updatedDataAllocations = [...dataAllocations];

      allocations.forEach(({ MaNDT, SoLuong, ...rest }) => {
        // Tìm kiếm mục "Đã phân bổ" trong danh sách
        const existingAllocatedIndex = updatedDataAllocations.findIndex(
          (item) =>
            item.MaNDT.trim() === MaNDT.trim() && item.status === "Đã phân bổ"
        );

        // Tìm kiếm mục "Chưa phân bổ" trong danh sách
        const existingUnallocatedIndex = updatedDataAllocations.findIndex(
          (item) =>
            item.MaNDT.trim() === MaNDT.trim() && item.status === "Chưa phân bổ"
        );

        if (existingUnallocatedIndex >= 0) {
          // Nếu đã tồn tại mục "Chưa phân bổ", cập nhật số lượng
          updatedDataAllocations[existingUnallocatedIndex] = {
            ...updatedDataAllocations[existingUnallocatedIndex],
            SoLuong:
              updatedDataAllocations[existingUnallocatedIndex].SoLuong +
              SoLuong,
          };
        } else {
          // Thêm mục mới vào danh sách "Chưa phân bổ"
          updatedDataAllocations.push({
            MaNDT,
            SoLuong,
            status: "Chưa phân bổ",
            ...rest,
          });
        }

        if (existingAllocatedIndex >= 0) {
          // Nếu đã tồn tại mục "Đã phân bổ", giữ nguyên mục đó
          updatedDataAllocations[existingAllocatedIndex] = {
            ...updatedDataAllocations[existingAllocatedIndex],
          };
        }
      });

      setDataAllocations(updatedDataAllocations);
    }
  }, [allocations]);

  useEffect(() => {
    if (stockDetail?.MaCP) {
      const stock = stocks.find((s) => s.MaCP === stockDetail.MaCP);
      setSelectedStock(stock || null);
    }
  }, [stockDetail, stocks]);

  // Lấy danh sách tài khoản ngân hàng của nhà đầu tư
  const { data: bankAccounts } = useGetInvestorBankAccountsQuery(
    selectedInvestor?.MaNDT
  );

  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      MaNDT: "",
      MaTK: "",
      SoLuong: 0,
      GiaPhanBo: 0,
    },
    mode: "onChange",
  });

  const handleAddAllocation = (data: AllocationFormValues) => {
    data.MaNDT = data.MaNDT.trim();
    data.MaTK = data.MaTK.trim();
    if (!selectedStock) {
      toast.error("Vui lòng chọn mã cổ phiếu trước khi thêm phân bổ");
      return;
    }

    const existingIndex = allocations.findIndex((a) => a.MaNDT === data.MaNDT);

    if (existingIndex >= 0) {
      const updatedAllocations = [...allocations];
      updatedAllocations[existingIndex].SoLuong += data.SoLuong;
      setAllocations(updatedAllocations);
    } else {
      setAllocations([
        ...allocations,
        { ...data, TenNDT: selectedInvestor?.HoTen, status: "Chưa phân bổ" },
      ]);
    }

    form.reset();
  };

  const handleOpenDeleteDialog = (allocation: any) => {
    setAllocationToDelete(allocation);
    setIsDeleteDialogOpen(true);
  };

  const handleRemoveAllocation = (MaNDT: string, MaTK: string) => {
    if (!selectedStock) {
      toast.error("Vui lòng chọn mã cổ phiếu trước khi xóa phân bổ");
      return;
    }

    revokeInvestorDistribution(
      { maCP: selectedStock.MaCP.trim(), maNDT: MaNDT },
      {
        onSuccess: () => {
          setDataAllocations(
            dataAllocations.filter(
              (allocation) =>
                allocation.MaNDT !== MaNDT ||
                allocation.MaTK !== MaTK ||
                allocation.status !== "Đã phân bổ"
            )
          );
          refetchTotalDistributedData();
          toast.success("Xóa phân bổ thành công");
        },
        onError: (error: any) => {
          toast.error("Lỗi khi xóa phân bổ", {
            description: error?.message || "Đã xảy ra lỗi khi xóa phân bổ",
          });
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (allocationToDelete) {
      handleRemoveAllocation(allocationToDelete.MaNDT, allocationToDelete.MaTK);
      setIsDeleteDialogOpen(false);
      setAllocationToDelete(null);
    }
  };

  const handleOpenEditForm = (allocation: any) => {
    setSelectedAllocation(allocation);
    setIsEditOpen(true);
  };

  const handleUpdateAllocation = (updatedAllocation: {
    MaCP: string;
    MaNDT: string;
    SoLuong: number;
  }) => {
    if (!selectedStock) {
      toast.error("Vui lòng chọn mã cổ phiếu trước khi cập nhật phân bổ");
      return;
    }
    console.log("Updated allocation:", updatedAllocation);

    updateInvestorDistribution(
      {
        maCP: selectedStock.MaCP.trim(),
        maNDT: updatedAllocation.MaNDT,
        newSoLuong: updatedAllocation.SoLuong,
      },
      {
        onSuccess: () => {
          const updatedDataAllocations = dataAllocations.map((dataAllocation) =>
            dataAllocation.MaNDT === updatedAllocation.MaNDT &&
            dataAllocation.status === "Đã phân bổ"
              ? { ...dataAllocation, SoLuong: updatedAllocation.SoLuong }
              : dataAllocation
          );
          setDataAllocations(updatedDataAllocations);
          refetchTotalDistributedData();
          toast.success("Cập nhật phân bổ thành công");
        },
        onError: (error: any) => {
          toast.error("Lỗi khi cập nhật phân bổ", {
            description: error?.message || "Đã xảy ra lỗi khi cập nhật phân bổ",
          });
        },
      }
    );
  };

  const handleSubmitAllocations = () => {
    if (!selectedStock || allocations.length === 0) {
      toast.error("Vui lòng chọn cổ phiếu và thêm phân bổ");
      return;
    }

    const payload = {
      maCP: selectedStock.MaCP,
      distributionList: allocations.map((allocation) => ({
        maNDT: allocation.MaNDT,
        maTK: allocation.MaTK,
        soLuong: allocation.SoLuong,
        gia: allocation.GiaPhanBo || 0,
      })),
    };

    distributeStock(payload, {
      onSuccess: () => {
        toast.success("Phân bổ cổ phiếu thành công");
        setAllocations([]);
        refetchTotalDistributedData();
      },
      onError: (error: any) => {
        toast.error("Lỗi phân bổ cổ phiếu", {
          description: error?.message || "Đã xảy ra lỗi khi phân bổ cổ phiếu",
        });
      },
    });
  };

  // Calculate the total shares being allocated in the current form
  const currentAllocationTotal = allocations.reduce(
    (total, item) => total + item.SoLuong,
    0
  );
  // Calculate remaining shares available for allocation
  const remainingShares = selectedStock
    ? selectedStock.SoLuongPH -
      totalDistributedData?.totalDistributed -
      currentAllocationTotal
    : 0;

  const onListingSubmit = async (values: any) => {
    if (!stockToList) return;
    console.log("Listing stock:", stockToList, values);

    if (shareholders?.length < 1) {
      toast.error("Số lượng người đã được phân bổ phải ít nhất là 1 người");
      return;
    }

    const totalAllocatedPercentage =
      (totalDistributedData?.totalDistributed / selectedStock.SoLuongPH) * 100;

    if (totalAllocatedPercentage < 15) {
      toast.error(
        "Tổng số lượng đã phân bổ phải đạt ít nhất 15% số lượng cổ phiếu phát hành"
      );
      return;
    }
    try {
      const GiaTC = values.GiaTC;

      await listStockMutation.mutateAsync(
        {
          maCP: stockToList.MaCP,
          initialGiaTC: GiaTC,
        },
        {
          onSuccess: () => {
            toast.success(
              `Đã niêm yết cổ phiếu ${stockToList.MaCP} thành công`
            );

            setShowListingDialog(false);
          },
          onError: (err) => {
            toast.error("Không thể niêm yết cổ phiếu", {
              description:
                err.message ||
                "Đã xảy ra lỗi khi niêm yết cổ phiếu. Vui lòng thử lại.",
            });
          },
        }
      );
    } catch (error) {
      toast.error("Không thể thực hiện thao tác", {
        description: error.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    }
  };

  const handleRemoveUnallocatedAllocation = (MaNDT: string, MaTK: string) => {
    // Cập nhật danh sách allocations
    const updatedAllocations = allocations.filter(
      (allocation) =>
        allocation.MaNDT.trim() !== MaNDT.trim() ||
        allocation.MaTK.trim() !== MaTK.trim() ||
        allocation.status !== "Chưa phân bổ"
    );

    setAllocations(updatedAllocations);

    // Cập nhật danh sách dataAllocations
    const updatedDataAllocations = dataAllocations.filter(
      (allocation) =>
        allocation.MaNDT !== MaNDT ||
        allocation.MaTK !== MaTK ||
        allocation.status !== "Chưa phân bổ"
    );
    setDataAllocations(updatedDataAllocations);

    toast.success("Đã xóa phân bổ chưa phân bổ");
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="stock-select">Chọn mã cổ phiếu</Label>
        <Select
          onValueChange={(value) => {
            const stock = stocks.find((s) => s.MaCP === value);
            setSelectedStock(stock || null);
          }}
          value={selectedStock?.MaCP || ""}
          disabled={!!stockDetail}
        >
          <SelectTrigger id="stock-select">
            <SelectValue placeholder="Chọn mã cổ phiếu" />
          </SelectTrigger>
          <SelectContent>
            {stocks.map((stock) => (
              <SelectItem key={stock.MaCP} value={stock.MaCP}>
                {stock.MaCP} - {stock.TenCty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStock && (
        <div className="p-4 border rounded-md bg-muted/50">
          <h3 className="font-medium mb-2">Thông tin cổ phiếu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Mã CP:</span>{" "}
              {selectedStock.MaCP}
            </div>
            <div>
              <span className="text-muted-foreground">Tên công ty:</span>{" "}
              {selectedStock.TenCty}
            </div>
            <div>
              <span className="text-muted-foreground">
                Tổng số lượng phát hành:
              </span>{" "}
              {selectedStock?.SoLuongPH?.toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">
                Số lượng đã phân bổ:
              </span>{" "}
              {totalDistributedData?.totalDistributed?.toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">
                Số lượng đang phân bổ:
              </span>{" "}
              {currentAllocationTotal?.toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">Số lượng còn lại:</span>{" "}
              {remainingShares?.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {selectedStock && (
        <form
          onSubmit={form.handleSubmit(handleAddAllocation)}
          className="space-y-4 p-4 border rounded-md"
        >
          <h3 className="font-medium">Thêm phân bổ cho nhà đầu tư</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Investor selection */}
            <div className="space-y-2">
              <Label htmlFor="investor-select">Nhà đầu tư</Label>
              <Controller
                name="MaNDT"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const investor = allInvestors?.find(
                        (i) => i.MaNDT === value
                      );
                      setSelectedInvestor(investor || null);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger id="investor-select">
                      <SelectValue placeholder="Chọn nhà đầu tư" />
                    </SelectTrigger>
                    <SelectContent>
                      {allInvestors?.map((investor) => (
                        <SelectItem key={investor.MaNDT} value={investor.MaNDT}>
                          {investor.HoTen}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.MaNDT && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.MaNDT.message}
                </p>
              )}
            </div>

            {/* Bank account selection */}
            <div className="space-y-2">
              <Label htmlFor="bank-account-select">Mã tài khoản</Label>
              <Controller
                name="MaTK"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!bankAccounts || bankAccounts.length === 0}
                  >
                    <SelectTrigger id="bank-account-select">
                      <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.MaTK} value={account.MaTK}>
                          {account.TenNH} - {account.MaTK}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.MaTK && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.MaTK.message}
                </p>
              )}
            </div>

            {/* Quantity input */}
            <div className="space-y-2">
              <Label htmlFor="quantity-input">Số lượng</Label>
              <Controller
                name="SoLuong"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="quantity-input"
                    type="number"
                    min="0"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="Nhập số lượng"
                  />
                )}
              />
              {form.formState.errors.SoLuong && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.SoLuong.message}
                </p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="price-input">Giá phân bổ (VNĐ)</Label>
              <Controller
                name="GiaPhanBo"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="price-input"
                    type="number"
                    min={0}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Nhập giá (nếu có)"
                  />
                )}
              />
            </div> */}

            {/* Add button */}
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Thêm vào danh sách
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Allocation list */}
      {dataAllocations?.length > 0 && (
        <div className="border rounded-md">
          <h3 className="font-medium p-4 border-b">Danh sách phân bổ</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã nhà đầu tư</TableHead>
                <TableHead>Tên nhà đầu tư</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead className="text-right">Trạng Thái</TableHead>

                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataAllocations?.map((allocation) => (
                <TableRow key={`${allocation.MaNDT}`}>
                  <TableCell>{allocation.MaNDT}</TableCell>
                  <TableCell>{allocation.TenNDT}</TableCell>
                  <TableCell>{allocation.SoLuong.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        allocation.status === "Đã phân bổ"
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }`}
                    >
                      {allocation?.status}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Nút Xóa cho trạng thái "Chưa phân bổ" */}
                      {allocation.status === "Chưa phân bổ" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveUnallocatedAllocation(
                                    allocation.MaNDT,
                                    allocation.MaTK
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Xóa phân bổ chưa phân bổ
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Nút Xóa và Cập nhật cho trạng thái "Đã phân bổ" */}
                      {allocation.status === "Đã phân bổ" && (
                        <>
                          {/* Nút Xóa */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenDeleteDialog(allocation)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xóa phân bổ</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Nút Cập nhật */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditForm(allocation)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cập nhật phân bổ</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">Tổng phân bổ:</span>{" "}
              {allocations
                .reduce((total, item) => total + item.SoLuong, 0)
                .toLocaleString()}{" "}
              cổ phiếu
            </div>
            <Button
              onClick={handleSubmitAllocations}
              disabled={allocations.length === 0}
            >
              Xác nhận phân bổ
            </Button>
          </div>
        </div>
      )}
      <ListingDialog
        open={showListingDialog}
        onOpenChange={setShowListingDialog}
        onSubmit={onListingSubmit}
        stock={stockToList}
      />
      {/* Form chỉnh sửa */}
      {selectedAllocation && (
        <EditAllocationForm
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          allocation={selectedAllocation}
          onSubmit={handleUpdateAllocation}
        />
      )}

      {/* Dialog cảnh báo xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>
            Bạn có chắc chắn muốn xóa phân bổ này không? Hành động này không thể
            hoàn tác.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockAllocationForm;
