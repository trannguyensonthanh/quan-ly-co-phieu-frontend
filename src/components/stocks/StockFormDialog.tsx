import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Stock } from '@/utils/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useGoongAddressAutocomplete } from '@/hooks/useGoongAddressAutocomplete';

const baseStockSchema = z.object({
  MaCP: z
    .string()
    .min(2, 'Mã cổ phiếu phải có ít nhất 2 ký tự')
    .max(5, 'Mã cổ phiếu tối đa 5 ký tự'),
  TenCty: z.string().min(5, 'Tên công ty phải có ít nhất 5 ký tự'),
  DiaChi: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  SoLuongPH: z.coerce.number().min(1, 'Số lượng cổ phiếu phải lớn hơn 0'),
});

type BaseStockFormValues = z.infer<typeof baseStockSchema>;

interface StockFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BaseStockFormValues) => void;
  editingStock: Stock | null;
  setEditingStock: (stock: Stock | null) => void;
}

export function StockFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingStock,
  setEditingStock,
}: StockFormDialogProps) {
  const form = useForm<BaseStockFormValues>({
    resolver: zodResolver(baseStockSchema),
    defaultValues: {
      MaCP: editingStock?.MaCP.trim() || '',
      TenCty: editingStock?.TenCty || '',
      DiaChi: editingStock?.DiaChi || '',
      SoLuongPH: editingStock?.SoLuongPH ?? 0,
    },
  });

  const {
    addresses,
    loading: addressLoading,
    error: addressError,
    searchAddress,
  } = useGoongAddressAutocomplete();
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  useEffect(() => {
    if (editingStock) {
      form.reset({
        MaCP: editingStock.MaCP.trim(),
        TenCty: editingStock.TenCty,
        DiaChi: editingStock.DiaChi,
        SoLuongPH: editingStock.SoLuongPH ?? 0,
      });
    }
  }, [editingStock, form]);

  const handleClose = () => {
    form.reset({
      MaCP: '',
      TenCty: '',
      DiaChi: '',
      SoLuongPH: 0,
    });
    onOpenChange(false);
    console.log('Closed dialog');
    setEditingStock(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        } else {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingStock ? 'Cập nhật cổ phiếu' : 'Thêm cổ phiếu mới'}
          </DialogTitle>
        </DialogHeader>

        {!editingStock && (
          <p className="text-sm text-red-500">
            Bạn hãy kiểm tra kĩ trước khi thêm cổ phiếu, sau khi thêm bạn không
            thể thay đổi mã cổ phiếu.
          </p>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values);
              form.reset({
                MaCP: '',
                TenCty: '',
                DiaChi: '',
                SoLuongPH: 0,
              });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="MaCP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã cổ phiếu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VNM"
                      {...field}
                      disabled={!!editingStock}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="TenCty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên công ty</FormLabel>
                  <FormControl>
                    <Input placeholder="Công ty CP Sữa Việt Nam" {...field} />
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
                        placeholder="Số 10 Tân Trào, Tân Phú, Quận 7, TP.HCM"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          searchAddress(e.target.value);
                          setShowAddressDropdown(true);
                        }}
                        autoComplete="off"
                        onBlur={() =>
                          setTimeout(() => setShowAddressDropdown(false), 200)
                        }
                        onFocus={() =>
                          addresses.length > 0 && setShowAddressDropdown(true)
                        }
                      />
                      {addressLoading && (
                        <div className="absolute right-2 top-2 text-xs text-gray-400 animate-pulse">
                          Đang tìm...
                        </div>
                      )}
                      {addresses.length > 0 && showAddressDropdown && (
                        <ul className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow mt-1 max-h-48 overflow-y-auto">
                          {addresses.map((addr, idx) => (
                            <li
                              key={idx}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                              onClick={() => {
                                field.onChange(addr);
                                form.setValue('DiaChi', addr, {
                                  shouldValidate: true,
                                });
                                setShowAddressDropdown(false);
                              }}
                            >
                              {addr}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {addressError && (
                    <div className="text-xs text-red-500 mt-1">
                      {addressError}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="SoLuongPH"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổng số cổ phiếu</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {editingStock ? 'Cập nhật' : 'Thêm'} cổ phiếu
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
