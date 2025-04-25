import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  Database,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Loader,
  RefreshCw,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useCreateDeviceMutation,
  useGetBackupHistoryListQuery,
  usePerformBackupMutation,
  usePerformRestoreMutation,
} from "@/queries/admin.queries";

interface BackupFile {
  id: string; // ID của bản backup
  fileName: string;
  filePath: string; // Đường dẫn đến file backup trên server
  fileSize: number; // Kích thước file backup (bytes)
  fileSizeMB: number; // Kích thước file backup (MB)
  createdAt: string | Date; // API trả về string ISO, có thể convert sang Date
  cleanupPerformed: boolean; // True nếu đã thực hiện xóa bản backup cũ
}

const DatabaseBackupPage = () => {
  const { toast } = useToast();
  const [deviceStatus, setDeviceStatus] = useState<
    "checking" | "exists" | "not_exists"
  >("checking");
  const [devicePath, setDevicePath] = useState<string>("C:\\SQLBackups");
  const [deleteOldBackups, setDeleteOldBackups] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [usePointInTime, setUsePointInTime] = useState(false);
  const [pointInTimeDate, setPointInTimeDate] = useState("");
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  const createDeviceMutation = useCreateDeviceMutation();
  const performBackupMutation = usePerformBackupMutation();
  const {
    data: backupHistory,
    isFetching: isFetchingBackupHistory,
    refetch: refetchBackupHistory,
  } = useGetBackupHistoryListQuery();
  const performRestoreMutation = usePerformRestoreMutation();
  useEffect(() => {
    if (backupHistory) {
      const formattedBackups = backupHistory.map((backup) => ({
        id: backup.id,
        fileName: backup.fileName,
        filePath: backup.filePath || "", // Provide a default value if missing
        fileSize: backup.fileSize || 0, // Provide a default value if missing
        fileSizeMB: backup.fileSizeMB,
        createdAt: new Date(backup.createdAt).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        cleanupPerformed: backup.cleanupPerformed || false, // Provide a default value if missing
      }));
      setBackupFiles(formattedBackups || []);
    }
  }, [backupHistory]);
  // Mock data initialization
  useEffect(() => {
    // Simulate API call to check device status
    setTimeout(() => {
      setDeviceStatus("exists");
    }, 1500);
  }, []);

  const checkDevice = () => {
    setDeviceStatus("checking");

    createDeviceMutation.mutate(undefined, {
      onSuccess: () => {
        setDeviceStatus("exists");
        toast({
          title: "Kiểm tra thiết bị thành công",
          description: "Thiết bị sao lưu đã tồn tại và sẵn sàng sử dụng.",
        });
      },
      onError: () => {
        setDeviceStatus("not_exists");
        toast({
          title: "Lỗi",
          description: "Không thể kiểm tra hoặc tạo thiết bị sao lưu.",
          variant: "destructive",
        });
      },
    });
  };

  const startBackup = () => {
    setBackupInProgress(true);

    performBackupMutation.mutate(
      { deleteAllOld: deleteOldBackups },
      {
        onSuccess: (data) => {
          setBackupInProgress(false);
          refetchBackupHistory(); // Refresh the backup history list after a successful backup
          toast({
            title: "Sao lưu thành công",
            description: `Đã tạo bản sao lưu mới: ${data.fileName}`,
          });
        },
        onError: () => {
          setBackupInProgress(false);
          toast({
            title: "Lỗi",
            description: "Không thể tạo bản sao lưu.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const openRestoreDialog = (backup: BackupFile) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
    setUsePointInTime(false);
    setPointInTimeDate("");
  };

  const startRestore = () => {
    if (!selectedBackup) return;

    setRestoreInProgress(true);

    performRestoreMutation.mutate(
      {
        backupFileName: selectedBackup.fileName,
        pointInTime: usePointInTime ? pointInTimeDate : null,
      },
      {
        onSuccess: () => {
          setRestoreInProgress(false);
          setRestoreDialogOpen(false);

          toast({
            title: "Phục hồi thành công",
            description: usePointInTime
              ? `Đã phục hồi dữ liệu từ ${selectedBackup.fileName} đến thời điểm ${pointInTimeDate}`
              : `Đã phục hồi dữ liệu từ bản sao lưu ${selectedBackup.fileName}`,
          });

          setSelectedBackup(null);
          setUsePointInTime(false);
          setPointInTimeDate("");
          refetchBackupHistory();
        },
        onError: () => {
          setRestoreInProgress(false);

          toast({
            title: "Lỗi",
            description: "Không thể phục hồi dữ liệu.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const refreshBackupList = () => {
    refetchBackupHistory();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sao lưu và phục hồi dữ liệu</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Thiết bị sao lưu
          </CardTitle>
          <CardDescription>
            Tạo và kiểm tra thiết bị sao lưu dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tên thiết bị</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input flex items-center bg-muted">
                  QUAN_LY_GIAO_DICH_CO_PHIEU_DeviceDefault
                </div>
              </div>

              <div className="space-y-2">
                <Label>Đường dẫn vật lý</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input flex items-center bg-muted">
                  {devicePath}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input flex items-center">
                  {deviceStatus === "checking" && (
                    <span className="flex items-center text-muted-foreground">
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </span>
                  )}
                  {deviceStatus === "exists" && (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Đã tồn tại
                    </span>
                  )}
                  {deviceStatus === "not_exists" && (
                    <span className="flex items-center text-amber-600">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Chưa tạo
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={checkDevice}
              disabled={deviceStatus === "checking"}
            >
              {deviceStatus === "checking" ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Tạo / Kiểm tra Device Sao lưu
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Sao lưu dữ liệu
          </CardTitle>
          <CardDescription>
            Tạo bản sao lưu mới cho dữ liệu của hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="deleteOldBackups"
                checked={deleteOldBackups}
                onCheckedChange={(checked) =>
                  setDeleteOldBackups(checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="deleteOldBackups"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Xóa tất cả các bản sao lưu cũ trước khi sao lưu bản mới
                </Label>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full p-0"
                      >
                        <HelpCircle className="h-3 w-3" />
                        <span className="sr-only">Trợ giúp</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">
                        Thao tác xóa chỉ thực hiện sau khi bản sao lưu mới tạo
                        thành công để đảm bảo an toàn. Nếu không chọn, các bản
                        sao lưu cũ sẽ được giữ lại.
                      </p>
                    </PopoverContent>
                  </Popover>
                  <span className="ml-1">
                    Thao tác xóa chỉ thực hiện sau khi bản sao lưu mới tạo thành
                    công để đảm bảo an toàn.
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full md:w-auto"
              onClick={startBackup}
              disabled={deviceStatus !== "exists" || backupInProgress}
            >
              {backupInProgress ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Đang sao lưu...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Bắt đầu Sao lưu (Full Backup)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Lịch sử sao lưu</CardTitle>
            <CardDescription>Danh sách các bản sao lưu đã tạo</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBackupList}
            disabled={isFetchingBackupHistory}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isFetchingBackupHistory ? "animate-spin" : ""
              }`}
            />
            Làm mới
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead className="text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingBackupHistory ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader className="h-8 w-8 animate-spin mb-2" />
                      <p>Đang tải danh sách sao lưu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : backupFiles.length > 0 ? (
                backupFiles.map((backup, index) => (
                  <TableRow key={backup.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {backup.fileName}
                    </TableCell>
                    <TableCell>
                      {typeof backup.createdAt === "string"
                        ? backup.createdAt
                        : backup.createdAt.toLocaleString()}
                    </TableCell>
                    <TableCell>{backup.fileSizeMB}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRestoreDialog(backup)}
                      >
                        Phục hồi từ bản này
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Chưa có bản sao lưu nào trong hệ thống
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Phục hồi dữ liệu</DialogTitle>
            <DialogDescription>
              {selectedBackup &&
                `Phục hồi dữ liệu từ bản sao lưu: ${selectedBackup.fileName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Cảnh báo
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      Việc phục hồi dữ liệu sẽ xóa tất cả dữ liệu hiện tại và
                      thay thế bằng dữ liệu từ bản sao lưu. Quá trình này không
                      thể hoàn tác.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={startRestore}
                  disabled={restoreInProgress}
                >
                  {restoreInProgress ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Đang phục hồi...
                    </>
                  ) : (
                    <>
                      Phục hồi toàn bộ về bản đã chọn
                      {selectedBackup && ` (${selectedBackup.fileName})`}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-start space-x-2 pt-2 border-t">
                <Checkbox
                  id="usePointInTime"
                  checked={usePointInTime}
                  onCheckedChange={(checked) =>
                    setUsePointInTime(checked === true)
                  }
                  disabled={restoreInProgress}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="usePointInTime"
                    className="text-sm font-medium leading-none"
                  >
                    Phục hồi đến thời điểm cụ thể (Point-in-Time)
                  </Label>
                </div>
              </div>

              {usePointInTime && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="pointInTimeDate">Thời điểm phục hồi</Label>
                  <Input
                    id="pointInTimeDate"
                    type="datetime-local"
                    value={pointInTimeDate}
                    onChange={(e) => setPointInTimeDate(e.target.value)}
                    disabled={restoreInProgress}
                  />
                  <p className="text-xs text-muted-foreground">
                    Thời điểm phải sau thời gian tạo bản sao lưu đã chọn và
                    trước thời điểm hiện tại.
                  </p>

                  <Button
                    variant="default"
                    className="w-full mt-4"
                    onClick={startRestore}
                    disabled={restoreInProgress || !pointInTimeDate}
                  >
                    {restoreInProgress ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Đang phục hồi...
                      </>
                    ) : (
                      <>Bắt đầu phục hồi đến thời điểm cụ thể</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={restoreInProgress}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseBackupPage;
