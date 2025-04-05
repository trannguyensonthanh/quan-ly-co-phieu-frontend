
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, Database, FileDown, Save } from "lucide-react";

const DatabaseBackupPage = () => {
  const { toast } = useToast();
  const [backupName, setBackupName] = useState("");
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Mock backup history
  const mockBackups = [
    { id: 1, name: "backup_20250401_120000", date: "2025-04-01 12:00:00", size: "42.5 MB" },
    { id: 2, name: "backup_20250402_080000", date: "2025-04-02 08:00:00", size: "43.1 MB" },
    { id: 3, name: "backup_20250403_220000", date: "2025-04-03 22:00:00", size: "44.2 MB" },
    { id: 4, name: "backup_20250405_160000", date: "2025-04-05 16:00:00", size: "44.7 MB" },
  ];

  const handleBackup = () => {
    if (!backupName.trim()) {
      toast({
        title: "Lỗi sao lưu",
        description: "Vui lòng nhập tên cho bản sao lưu",
        variant: "destructive",
      });
      return;
    }
    
    setBackupInProgress(true);
    
    // Simulate backup process
    setTimeout(() => {
      setBackupInProgress(false);
      toast({
        title: "Sao lưu thành công",
        description: `Dữ liệu đã được sao lưu thành công với tên ${backupName}`,
      });
      setBackupName("");
    }, 2000);
  };

  const handleRestore = () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi phục hồi",
        description: "Vui lòng chọn tập tin để phục hồi",
        variant: "destructive",
      });
      return;
    }
    
    setRestoreInProgress(true);
    
    // Simulate restore process
    setTimeout(() => {
      setRestoreInProgress(false);
      toast({
        title: "Phục hồi thành công",
        description: `Dữ liệu đã được phục hồi thành công từ tập tin ${selectedFile.name}`,
      });
      setSelectedFile(null);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownload = (backupName: string) => {
    toast({
      title: "Tải xuống bản sao lưu",
      description: `Đang tải xuống bản sao lưu ${backupName}`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sao lưu và phục hồi dữ liệu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Save className="mr-2 h-5 w-5" />
              Sao lưu dữ liệu
            </CardTitle>
            <CardDescription>
              Tạo bản sao lưu dữ liệu của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backupName">Tên bản sao lưu</Label>
                <Input 
                  id="backupName"
                  placeholder="Nhập tên bản sao lưu"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nếu để trống, hệ thống sẽ tự động đặt tên theo định dạng thời gian
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleBackup}
                disabled={backupInProgress}
              >
                {backupInProgress ? (
                  <>Đang sao lưu...</>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Bắt đầu sao lưu
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Phục hồi dữ liệu
            </CardTitle>
            <CardDescription>
              Phục hồi dữ liệu từ bản sao lưu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restoreFile">Chọn tập tin</Label>
                <Input 
                  id="restoreFile"
                  type="file"
                  accept=".bak,.sql"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ định dạng .bak hoặc .sql
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleRestore}
                disabled={!selectedFile || restoreInProgress}
              >
                {restoreInProgress ? (
                  <>Đang phục hồi...</>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Bắt đầu phục hồi
                  </>
                )}
              </Button>
              
              <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Cảnh báo
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Việc phục hồi dữ liệu sẽ xóa tất cả dữ liệu hiện tại và thay thế bằng dữ liệu từ bản sao lưu. Quá trình này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử sao lưu</CardTitle>
          <CardDescription>
            Danh sách các bản sao lưu đã tạo
          </CardDescription>
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
              {mockBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.id}</TableCell>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(backup.name)}>
                      <FileDown className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseBackupPage;
