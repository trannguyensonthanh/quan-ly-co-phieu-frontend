import React from 'react';
import { cn } from '@/lib/utils'; // Đảm bảo bạn đã import hàm tiện ích này
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'; // Sử dụng Tooltip từ shadcn
import {
  Loader2,
  PlayCircle,
  Settings,
  CalendarClock,
  Info,
} from 'lucide-react';

interface OrderAutoControlProps {
  isAuto: boolean;
  onToggleAuto: (val: boolean) => void;
  onATO: () => void;
  onLO: () => void;
  onATC: () => void;
  onPrepareNextDay: () => void;
  onPrepareToday?: () => void;
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
  onPrepareToday,
  isTradingHours,
  loadingKey,
}) => {
  const isLoading = (key: string) => loadingKey === key;

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-switch"
                  checked={isAuto}
                  onCheckedChange={onToggleAuto}
                  aria-label="Chế độ khớp lệnh"
                />
                <label htmlFor="auto-switch" className="font-semibold">
                  Tự động khớp lệnh
                </label>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  isAuto
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                )}
              >
                {isAuto ? 'Đang bật' : 'Đang tắt'}
              </span>
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isAuto
                    ? 'Hệ thống sẽ tự động thực hiện các phiên khớp lệnh.'
                    : 'Hệ thống yêu cầu thao tác thủ công từ nhân viên.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            {isAuto
              ? 'Hệ thống đang hoạt động ở chế độ tự động. Mọi phiên khớp lệnh sẽ được thực thi theo lịch trình.'
              : 'Hệ thống đang ở chế độ thủ công. Vui lòng thực hiện các bước bên dưới để điều khiển phiên giao dịch.'}
          </CardDescription>
        </CardHeader>

        {!isAuto && (
          <CardContent className="space-y-6 pt-2">
            {/* Nhóm các nút điều khiển phiên */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Điều khiển phiên giao dịch
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={onATO}
                  disabled={!!loadingKey}
                  className="w-full"
                >
                  {isLoading('ATO') ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  Khớp lệnh ATO
                </Button>
                <Button
                  onClick={onLO}
                  disabled={!!loadingKey}
                  className="w-full"
                >
                  {isLoading('LO') ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  Khớp lệnh LO
                </Button>
                <Button
                  onClick={onATC}
                  disabled={!!loadingKey}
                  className="w-full"
                >
                  {isLoading('ATC') ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  Khớp lệnh ATC
                </Button>
              </div>
            </div>

            {/* Nhóm các nút tác vụ chuẩn bị */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Tác vụ chuẩn bị
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onPrepareToday && (
                  <Button
                    variant="outline"
                    onClick={onPrepareToday}
                    disabled={!!loadingKey}
                    className="w-full"
                  >
                    {isLoading('PREPARE_TODAY_PRICES') ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
                    Chuẩn bị giá hôm nay
                  </Button>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Bọc nút trong một div để Tooltip hoạt động ngay cả khi nút bị vô hiệu hóa */}
                    <div className="w-full">
                      <Button
                        variant="outline"
                        onClick={onPrepareNextDay}
                        disabled={isTradingHours || !!loadingKey}
                        className="w-full"
                      >
                        {isLoading('PREPARE') ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CalendarClock className="mr-2 h-4 w-4" />
                        )}
                        Chuẩn bị ngày tiếp theo
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {isTradingHours && (
                    <TooltipContent>
                      <p>Chỉ có thể thực hiện tác vụ này sau giờ giao dịch.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};
