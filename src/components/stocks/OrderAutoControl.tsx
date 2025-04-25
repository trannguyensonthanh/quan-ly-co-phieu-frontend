import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

interface OrderAutoControlProps {
  isAuto: boolean;
  onToggleAuto: (val: boolean) => void;
  onATO: () => void;
  onLO: () => void;
  onATC: () => void;
  onPrepareNextDay: () => void;
  isTradingHours: boolean;
  loadingKey?: string;
}

export const OrderAutoControl: React.FC<OrderAutoControlProps> = ({
  isAuto,
  onToggleAuto,
  onATO,
  onLO,
  onATC,
  onPrepareNextDay,
  isTradingHours,
  loadingKey,
}) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isAuto}
                  onCheckedChange={onToggleAuto}
                  id="auto-switch"
                  aria-label="Bật/Tắt chế độ tự động khớp lệnh"
                  className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 transition-colors"
                />
                {isAuto ? (
                  <ToggleRight className="text-vivid-purple" />
                ) : (
                  <ToggleLeft className="text-gray-400 dark:text-gray-500" />
                )}
                <label
                  htmlFor="auto-switch"
                  className="font-semibold text-gray-900 dark:text-gray-100"
                >
                  Tự động khớp lệnh
                </label>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-gray-800 dark:bg-gray-900 text-white px-3 py-2 rounded"
            >
              {isAuto
                ? "Hệ thống sẽ khớp lệnh và chuẩn bị dữ liệu tự động đúng quy trình"
                : "Chuyển về chế độ thủ công, nhân viên sẽ thực hiện từng bước"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span
          className={`ml-3 text-xs px-2 py-1 rounded ${
            isAuto
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {isAuto ? "Đang tự động" : "Thủ công"}
        </span>
      </div>
      {!isAuto && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            onClick={onATO}
            disabled={loadingKey === "ATO"}
          >
            Kích hoạt ATO
          </Button>
          <Button
            variant="default"
            onClick={onLO}
            disabled={loadingKey === "LO"}
          >
            Kích hoạt LO
          </Button>
          <Button
            variant="default"
            onClick={onATC}
            disabled={loadingKey === "ATC"}
          >
            Kích hoạt ATC
          </Button>
          <Button
            variant="outline"
            onClick={onPrepareNextDay}
            disabled={isTradingHours || loadingKey === "PREPARE"}
            title={isTradingHours ? "Chỉ dùng sau khi sàn đóng" : ""}
          >
            Chuẩn bị dữ liệu cho ngày tiếp theo
          </Button>
        </div>
      )}
    </div>
  );
};
