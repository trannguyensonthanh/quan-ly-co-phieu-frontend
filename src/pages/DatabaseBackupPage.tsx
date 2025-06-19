/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  Database,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Loader,
  RefreshCw,
  History,
  FileClock,
  Archive,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useCreateDeviceMutation,
  useGetBackupHistoryListQuery,
  usePerformBackupMutation,
  usePerformRestoreMutation,
} from '@/queries/admin.queries';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils'; // Giả sử bạn có hàm tiện ích này từ shadcn

// Định nghĩa lại BackupFile cho phù hợp với API mới
interface BackupFile {
  position: number;
  name: string;
  description: string;
  type: number; // 1 = Full, 2 = Log
  backupDate: string; // ISO string
}

// Schema cho form backup
const backupSchema = z.object({
  backupType: z.enum(['Full', 'Log'], {
    required_error: 'Vui lòng chọn loại backup',
  }),
});
type BackupFormValues = z.infer<typeof backupSchema>;

// Kiểu dữ liệu cho thông tin xác nhận phục hồi
interface RestoreConfirmationInfo {
  positions: number[];
  pointInTime?: string;
}

const DatabaseBackupPage = () => {
  const { toast } = useToast();
  const [deviceStatus, setDeviceStatus] = useState<
    'checking' | 'exists' | 'not_exists'
  >('checking');
  const [devicePath] = useState<string>(
    'C:\\SQLBackups\\QUAN_LY_GIAO_DICH_CO_PHIEU_DeviceDefault.bak'
  ); // Không cần set nữa nếu nó là hằng số
  const [deleteOldBackups, setDeleteOldBackups] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [pointInTimeDate, setPointInTimeDate] = useState('');

  // State quản lý việc mở dialog và thông tin để xác nhận
  const [restoreConfirmation, setRestoreConfirmation] =
    useState<RestoreConfirmationInfo | null>(null);

  const createDeviceMutation = useCreateDeviceMutation();
  const performBackupMutation = usePerformBackupMutation();
  const {
    data: backupHistory,
    isFetching: isFetchingBackupHistory,
    refetch: refetchBackupHistory,
  } = useGetBackupHistoryListQuery();
  const performRestoreMutation = usePerformRestoreMutation();

  const backupForm = useForm<BackupFormValues>({
    resolver: zodResolver(backupSchema),
    defaultValues: { backupType: 'Full' },
  });

  useEffect(() => {
    if (backupHistory) {
      setBackupFiles(backupHistory || []);
    }
  }, [backupHistory]);

  // Mock data initialization
  useEffect(() => {
    setTimeout(() => {
      // Giả sử API trả về là đã tồn tại
      // Trong thực tế, bạn nên gọi `checkDevice` ở đây
      setDeviceStatus('exists');
    }, 1500);
  }, []);

  const checkDevice = () => {
    setDeviceStatus('checking');
    createDeviceMutation.mutate(undefined, {
      onSuccess: () => {
        setDeviceStatus('exists');
        toast({
          title: 'Kiểm tra thành công',
          description: 'Thiết bị sao lưu đã tồn tại và sẵn sàng sử dụng.',
        });
      },
      onError: (error) => {
        setDeviceStatus('not_exists');
        toast({
          title: 'Lỗi',
          description:
            (error as any)?.message ||
            'Không thể kiểm tra hoặc tạo thiết bị sao lưu.',
          variant: 'destructive',
        });
      },
      onSettled: () => refetchBackupHistory(),
    });
  };

  const startBackup = (values: BackupFormValues) => {
    setBackupInProgress(true);
    performBackupMutation.mutate(
      { initDevice: deleteOldBackups, backupType: values.backupType },
      {
        onSuccess: (data) => {
          console.log('Backup successful:', data);
          toast({
            title: 'Sao lưu thành công',
            description: `Đã tạo bản sao lưu mới`,
          });
          refetchBackupHistory();
        },
        onError: (error) => {
          toast({
            title: 'Lỗi sao lưu',
            description:
              (error as any)?.message || 'Không thể tạo bản sao lưu.',
            variant: 'destructive',
          });
        },
        onSettled: () => setBackupInProgress(false),
      }
    );
  };

  // Hàm duy nhất để thực hiện phục hồi, được gọi từ dialog
  const startRestore = () => {
    if (!restoreConfirmation || restoreConfirmation.positions.length === 0) {
      return;
    }
    setRestoreInProgress(true);
    performRestoreMutation.mutate(restoreConfirmation, {
      onSuccess: () => {
        toast({
          title: 'Phục hồi thành công',
          description: `Dữ liệu đã được phục hồi thành công.`,
        });
        // Reset state sau khi thành công
        setRestoreConfirmation(null);
        setSelectedPositions([]);
        setPointInTimeDate('');
        refetchBackupHistory();
      },
      onError: (error) => {
        toast({
          title: 'Lỗi phục hồi',
          description: (error as any)?.message || 'Không thể phục hồi dữ liệu.',
          variant: 'destructive',
        });
      },
      onSettled: () => setRestoreInProgress(false),
    });
  };

  // --- LOGIC TÍNH TOÁN CHUỖI PHỤC HỒI ---

  const buildRestoreChainForPosition = (
    position: number,
    backups: BackupFile[]
  ): number[] => {
    const sorted = [...backups].sort((a, b) => a.position - b.position);
    let fullIdx = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].position > position) break;
      if (sorted[i].type === 1) fullIdx = i;
    }
    if (fullIdx === -1) return [];
    return sorted
      .slice(fullIdx, sorted.findIndex((b) => b.position === position) + 1)
      .map((b) => b.position);
  };

  const buildRestoreChainForPointInTime = (
    datetime: string,
    backups: BackupFile[]
  ): number[] => {
    const targetDate = new Date(datetime);
    if (isNaN(targetDate.getTime())) return [];

    const sorted = [...backups].sort((a, b) => a.position - b.position);
    let fullIdx = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (new Date(sorted[i].backupDate) > targetDate) break;
      if (sorted[i].type === 1) fullIdx = i;
    }
    if (fullIdx === -1) return [];

    const chain: number[] = [sorted[fullIdx].position];
    for (let i = fullIdx + 1; i < sorted.length; i++) {
      if (
        sorted[i].type === 2 &&
        new Date(sorted[i].backupDate) <= targetDate
      ) {
        chain.push(sorted[i].position);
      }
    }
    return chain;
  };

  // Xử lý khi người dùng chọn một hàng trong bảng
  const handleSelectPosition = (position: number) => {
    const chain = buildRestoreChainForPosition(position, backupFiles);
    setSelectedPositions(chain);
    // Bỏ chọn PIT khi người dùng tương tác với bảng
    setPointInTimeDate('');
  };

  // Xử lý khi người dùng muốn phục hồi theo chuỗi đã chọn từ bảng
  const handleChainRestore = () => {
    if (selectedPositions.length === 0) return;
    setRestoreConfirmation({ positions: selectedPositions });
  };

  // Xử lý khi người dùng muốn phục hồi đến một thời điểm
  const handlePointInTimeRestore = () => {
    if (!pointInTimeDate) return;
    const chain = buildRestoreChainForPointInTime(pointInTimeDate, backupFiles);
    if (chain.length === 0) {
      toast({
        title: 'Không tìm thấy chuỗi phục hồi',
        description:
          'Không có bản FULL backup nào phù hợp trước thời điểm bạn chọn. Vui lòng chọn thời gian khác.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedPositions(chain);
    setRestoreConfirmation({ positions: chain, pointInTime: pointInTimeDate });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Sao lưu & Phục hồi Dữ liệu
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ----- CỘT BÊN TRÁI: THIẾT BỊ VÀ TẠO BACKUP ----- */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Thiết bị sao lưu
              </CardTitle>
              <CardDescription>
                Kiểm tra và khởi tạo thiết bị vật lý để lưu trữ các bản sao lưu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Đường dẫn vật lý</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input flex items-center bg-muted text-muted-foreground">
                  {devicePath}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input flex items-center">
                  {deviceStatus === 'checking' && (
                    <span className="flex items-center text-muted-foreground">
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </span>
                  )}
                  {deviceStatus === 'exists' && (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Sẵn sàng
                    </span>
                  )}
                  {deviceStatus === 'not_exists' && (
                    <span className="flex items-center text-amber-600">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Chưa tồn tại
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={checkDevice}
                disabled={deviceStatus === 'checking'}
              >
                {deviceStatus === 'checking' ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Tạo / Kiểm tra Device
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="mr-2 h-5 w-5" />
                Tạo bản sao lưu mới
              </CardTitle>
              <CardDescription>
                Tạo một bản sao lưu toàn bộ (Full) hoặc chỉ các thay đổi (Log).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...backupForm}>
                <form
                  onSubmit={backupForm.handleSubmit(startBackup)}
                  className="space-y-6"
                >
                  <FormField
                    control={backupForm.control}
                    name="backupType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại backup</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Full" id="backup-full" />
                              </FormControl>
                              <FormLabel htmlFor="backup-full">Full</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Log" id="backup-log" />
                              </FormControl>
                              <FormLabel htmlFor="backup-log">Log</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="deleteOldBackups"
                      checked={deleteOldBackups}
                      onCheckedChange={(checked) =>
                        setDeleteOldBackups(checked === true)
                      }
                      className="mt-0.5"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="deleteOldBackups" className="font-medium">
                        Xóa các bản sao lưu cũ
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Tạo một bản sao lưu mới và xóa tất cả các bản cũ trước
                        đó.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={deviceStatus !== 'exists' || backupInProgress}
                  >
                    {backupInProgress ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Archive className="mr-2 h-4 w-4" />
                    )}
                    Bắt đầu Sao lưu
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* ----- CỘT BÊN PHẢI: LỊCH SỬ VÀ PHỤC HỒI ----- */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Lịch sử & Phục hồi
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchBackupHistory()}
                disabled={isFetchingBackupHistory}
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 mr-2',
                    isFetchingBackupHistory && 'animate-spin'
                  )}
                />
                Làm mới
              </Button>
            </div>
            <CardDescription>
              Xem lại các bản sao lưu và thực hiện phục hồi dữ liệu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col space-y-4">
            {/* --- KHU VỰC PHỤC HỒI POINT-IN-TIME --- */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <Label
                htmlFor="pointInTimeDate"
                className="flex items-center font-semibold"
              >
                <FileClock className="mr-2 h-4 w-4 text-primary" />
                Phục hồi đến một thời điểm
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  id="pointInTimeDate"
                  type="datetime-local"
                  value={pointInTimeDate}
                  onChange={(e) => {
                    setPointInTimeDate(e.target.value);
                    setSelectedPositions([]); // Bỏ chọn bảng khi nhập PIT
                  }}
                  className="w-full sm:w-auto flex-grow"
                />
                <Button
                  onClick={handlePointInTimeRestore}
                  disabled={!pointInTimeDate || restoreInProgress}
                  className="whitespace-nowrap"
                >
                  <History className="mr-2 h-4 w-4" /> Phục hồi
                </Button>
              </div>
            </div>

            {/* --- BẢNG LỊCH SỬ --- */}
            <div className="relative flex-grow">
              <div className="absolute inset-0 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[70px]">Vị trí</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFetchingBackupHistory ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                          <Loader className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : backupFiles.length > 0 ? (
                      backupFiles.map((backup) => (
                        <TableRow
                          key={backup.position}
                          onClick={() => handleSelectPosition(backup.position)}
                          className={cn(
                            'cursor-pointer',
                            selectedPositions.includes(backup.position) &&
                              'bg-primary/10'
                          )}
                        >
                          <TableCell
                            onClick={(e) => e.stopPropagation()}
                            className="py-2"
                          >
                            <Checkbox
                              checked={selectedPositions.includes(
                                backup.position
                              )}
                              onCheckedChange={() =>
                                handleSelectPosition(backup.position)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-mono text-center">
                            {backup.position}
                          </TableCell>
                          <TableCell className="font-medium">
                            {backup.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                'px-2 py-1 text-xs font-semibold rounded-full',
                                backup.type === 1
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              )}
                            >
                              {backup.type === 1 ? 'Full' : 'Log'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(backup.backupDate).toLocaleString(
                              'vi-VN'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-48 text-center text-muted-foreground"
                        >
                          Chưa có bản sao lưu nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={
                selectedPositions.length === 0 ||
                pointInTimeDate !== '' ||
                restoreInProgress
              }
              onClick={handleChainRestore}
            >
              <History className="mr-2 h-4 w-4" />
              {selectedPositions.length > 0
                ? `Phục hồi ${selectedPositions.length} bản đã chọn`
                : 'Phục hồi chuỗi đã chọn'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ----- DIALOG XÁC NHẬN PHỤC HỒI (CHUNG) ----- */}
      <Dialog
        open={!!restoreConfirmation}
        onOpenChange={(open) => !open && setRestoreConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận Phục hồi Dữ liệu</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Vui lòng xác nhận thông tin phục
              hồi dưới đây.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Cảnh báo Quan trọng
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      Toàn bộ dữ liệu hiện tại sẽ bị{' '}
                      <span className="font-bold">XÓA SẠCH</span> và được thay
                      thế bằng dữ liệu từ các bản sao lưu đã chọn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Chuỗi backup sẽ sử dụng:</span>
                <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                  {restoreConfirmation?.positions.join(', ')}
                </span>
              </p>
              {restoreConfirmation?.pointInTime && (
                <p>
                  <span className="font-semibold">Phục hồi đến thời điểm:</span>
                  <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">
                    {new Date(restoreConfirmation.pointInTime).toLocaleString(
                      'vi-VN'
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setRestoreConfirmation(null)}
              disabled={restoreInProgress}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={startRestore}
              disabled={restoreInProgress}
            >
              {restoreInProgress ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <History className="mr-2 h-4 w-4" />
              )}
              Xác nhận Phục hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseBackupPage;
