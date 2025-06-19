import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { User } from '@/utils/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateAccountMutation } from '@/queries/admin.queries';
import { useGoongAddressAutocomplete } from '@/hooks/useGoongAddressAutocomplete';

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (newData: Omit<User, 'id' | 'role'>) => void;
}

export default function UserEditDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserEditDialogProps) {
  // If no user selected, do not render dialog
  const userSchema = z.object({
    username: z.string().optional(),
    HoTen: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    Email: z.string().email('Email không hợp lệ'),
    NgaySinh: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải theo định dạng YYYY-MM-DD'),
    DiaChi: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
    Phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự'),
    CMND: z.string().min(9, 'Số CMND phải có ít nhất 9 ký tự'),
    GioiTinh: z.enum(['Nam', 'Nữ']),
    role: z.enum(['NhanVien', 'NhaDauTu']),
  });

  // This type will have all required fields
  type UserEditValues = z.infer<typeof userSchema>;
  console.log('UserEditDialog user:', user);
  const defaultValues: UserEditValues = user
    ? {
        username: user.username || '',
        HoTen: user.HoTen,
        Email: user.Email,
        NgaySinh: user.NgaySinh,
        DiaChi: user.DiaChi,
        Phone: user.Phone,
        CMND: user.CMND,
        GioiTinh: user.GioiTinh,
        role: user.role,
      }
    : {
        username: '',
        HoTen: '',
        Email: '',
        NgaySinh: '',
        DiaChi: '',
        Phone: '',
        CMND: '',
        GioiTinh: 'Nam',
        role: 'NhaDauTu',
      };

  const form = useForm<UserEditValues>({
    resolver: zodResolver(userSchema),
    defaultValues,
    values: defaultValues, // keep in sync if user changed!
    mode: 'onChange',
  });

  // Convert ISO date string to YYYY-MM-DD format for the form
  if (defaultValues.NgaySinh) {
    defaultValues.NgaySinh = new Date(defaultValues.NgaySinh)
      .toISOString()
      .split('T')[0];
  }

  function handleSubmit(values: UserEditValues) {
    // Explicitly cast to the required type to ensure type safety
    console.log('UserEditDialog values:', values);
    const userData = {
      username: values.username,
      HoTen: values.HoTen,
      Email: values.Email,
      NgaySinh: values.NgaySinh,
      DiaChi: values.DiaChi,
      Phone: values.Phone,
      CMND: values.CMND,
      GioiTinh: values.GioiTinh,
      role: values.role,
    };

    onSave(userData);
    onOpenChange(false);
  }

  const {
    addresses,
    loading: addressLoading,
    error: addressError,
    searchAddress,
  } = useGoongAddressAutocomplete();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài khoản và nhấn lưu để xác nhận thay đổi.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="HoTen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="NgaySinh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="DiaChi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="123 Đường ABC, Quận XYZ"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            searchAddress(e.target.value);
                          }}
                        />
                        {addressLoading && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            Đang tìm...
                          </span>
                        )}
                      </div>
                    </FormControl>
                    {/* Gợi ý địa chỉ */}
                    {addresses.length > 0 && (
                      <div className="absolute z-10 mt-1 w-1/2 rounded shadow-lg border max-h-48 overflow-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        {addresses.map((addr, idx) => (
                          <div
                            key={addr + idx}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-800 dark:text-gray-100 text-sm"
                            onClick={() => {
                              form.setValue('DiaChi', addr);
                              searchAddress('');
                            }}
                          >
                            {addr}
                          </div>
                        ))}
                      </div>
                    )}
                    {addressError && (
                      <div className="text-xs text-red-400 mt-1">
                        {addressError}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="CMND"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số CMND/CCCD</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="GioiTinh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai Trò</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NhanVien">Nhân Viên</SelectItem>
                        <SelectItem value="NhaDauTu">Nhà Đầu Tư</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Lưu thay đổi</Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset(defaultValues);
                    onOpenChange(false);
                  }}
                >
                  Hủy
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
