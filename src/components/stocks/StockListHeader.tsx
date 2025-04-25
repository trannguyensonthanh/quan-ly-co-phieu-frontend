import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Search, ArrowUpLeft } from "lucide-react";

interface StockListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: number | null;
  onStatusFilterChange: (value: string) => void;
  onAddClick: () => void;
  onUndo: () => void;
  onReload: () => void;
  canUndo: boolean;
}
export function StockListHeader({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
  onUndo,
  onReload,
  canUndo,
}: StockListHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 w-full">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm mã hoặc tên cổ phiếu..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 w-full"
          />
        </div>

        <Select
          value={statusFilter?.toString() || "all"}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="0">Chưa niêm yết</SelectItem>
            <SelectItem value="1">Đang giao dịch</SelectItem>
            <SelectItem value="2">Ngừng giao dịch</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm cổ phiếu
        </Button>

        <Button
          variant="outline"
          onClick={onUndo}
          disabled={!canUndo}
          className="w-[120px]"
        >
          <ArrowUpLeft className="mr-2 h-4 w-4" />
          Hoàn tác
        </Button>

        <Button variant="outline" onClick={onReload} className="w-[120px]">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tải lại
        </Button>
      </div>
    </div>
  );
}
