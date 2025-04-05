
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockUsers, mockBankAccounts, mockBanks } from '@/utils/mock-data';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';

const ProfilePage = () => {
  // In a real app, we would get the current user from auth context
  const user = mockUsers[0];
  const accounts = mockBankAccounts.filter(acc => acc.userId === user.id);
  
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cập nhật thông tin tài khoản thành công');
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }
    
    toast.success('Cập nhật mật khẩu thành công');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <TabsList>
                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                    <TabsTrigger value="password">Mật khẩu</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>Quản lý thông tin tài khoản</CardDescription>
              </CardHeader>
              
              <TabsContent value="profile">
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">Số CMND/CCCD</Label>
                        <Input
                          id="idNumber"
                          value={user.idNumber}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Thông tin này không thể thay đổi</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </form>
                </CardContent>
                
                <CardFooter>
                  <Button onClick={handleProfileSubmit}>Cập nhật thông tin</Button>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="password">
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </form>
                </CardContent>
                
                <CardFooter>
                  <Button onClick={handlePasswordSubmit}>Cập nhật mật khẩu</Button>
                </CardFooter>
              </TabsContent>
            </Card>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">Mã NDT: {user.id}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ngày sinh</span>
                  <span>{formatDate(user.birthDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Giới tính</span>
                  <span>{user.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ngày tham gia</span>
                  <span>01/01/2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản ngân hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map(account => {
                const bank = mockBanks.find(bank => bank.id === account.bankId);
                return (
                  <div key={account.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{bank?.name}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {account.id}
                      </span>
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(account.balance)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
