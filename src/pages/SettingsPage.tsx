
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";

const SettingsPage = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    priceAlerts: true,
    orderUpdates: true,
    marketNews: false
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cài đặt đã được lưu",
      description: "Thông tin cá nhân của bạn đã được cập nhật thành công.",
    });
  };

  const handleNotificationChange = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Cài đặt thông báo đã được lưu",
      description: "Tùy chọn thông báo của bạn đã được cập nhật thành công.",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Cài đặt giao diện đã được lưu",
      description: "Tùy chọn giao diện của bạn đã được cập nhật thành công.",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cài đặt</h2>
          <p className="text-muted-foreground">
            Quản lý cài đặt tài khoản và tùy chọn của bạn.
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="appearance">Giao diện</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input id="fullName" placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="example@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" placeholder="0123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" placeholder="123 Đường ABC, Quận XYZ, Thành phố..." />
                    </div>
                  </div>
                  <Button type="submit">Lưu thay đổi</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông báo</CardTitle>
                <CardDescription>
                  Cấu hình cách bạn nhận thông báo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Thông báo qua email</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo qua email.
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="priceAlerts">Cảnh báo giá</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi cổ phiếu đạt mức giá đã đặt.
                      </p>
                    </div>
                    <Switch 
                      id="priceAlerts" 
                      checked={notificationSettings.priceAlerts}
                      onCheckedChange={() => handleNotificationChange('priceAlerts')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderUpdates">Cập nhật lệnh</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi lệnh của bạn được khớp hoặc hủy.
                      </p>
                    </div>
                    <Switch 
                      id="orderUpdates" 
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={() => handleNotificationChange('orderUpdates')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketNews">Tin tức thị trường</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo về tin tức thị trường.
                      </p>
                    </div>
                    <Switch 
                      id="marketNews" 
                      checked={notificationSettings.marketNews}
                      onCheckedChange={() => handleNotificationChange('marketNews')}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications}>Lưu cài đặt</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Giao diện</CardTitle>
                <CardDescription>
                  Tùy chỉnh giao diện ứng dụng.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Chủ đề</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <div 
                        onClick={() => setTheme('light')}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${theme === 'light' ? 'border-primary' : 'border-muted'} bg-background`}
                      >
                        <span className="h-6 w-6 rounded-full bg-[#FFFFFF]" />
                      </div>
                      <div 
                        onClick={() => setTheme('dark')}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${theme === 'dark' ? 'border-primary' : 'border-muted'} bg-background`}
                      >
                        <span className="h-6 w-6 rounded-full bg-[#1A1A1A]" />
                      </div>
                      <div 
                        onClick={() => setTheme('system')}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${theme === 'system' ? 'border-primary' : 'border-muted'} bg-background`}
                      >
                        <span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#FFFFFF] to-[#1A1A1A]" />
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveAppearance}>Lưu cài đặt</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật</CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu và cài đặt bảo mật.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div />
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button>Cập nhật mật khẩu</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
