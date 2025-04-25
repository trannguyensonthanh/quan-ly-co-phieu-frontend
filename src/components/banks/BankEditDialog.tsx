import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Bank } from "@/utils/types";

// Define schema for bank editing
const bankSchema = z.object({
  MaNH: z
    .string()
    .regex(/^[A-Z0-9]+$/, "Mã ngân hàng chỉ được chứa chữ cái in hoa và số")
    .min(2, "Mã ngân hàng phải có ít nhất 2 ký tự")
    .max(10, "Mã ngân hàng không được vượt quá 10 ký tự"),
  TenNH: z
    .string()
    .regex(
      /^[a-zA-ZÀ-ỹ\s]+$/u,
      "Tên ngân hàng chỉ được chứa chữ cái, khoảng trắng và dấu tiếng Việt"
    )
    .min(2, "Tên ngân hàng phải có ít nhất 2 ký tự")
    .max(50, "Tên ngân hàng không được vượt quá 50 ký tự"),
  DiaChi: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(100, "Địa chỉ không được vượt quá 100 ký tự"),
  Phone: z
    .string()
    .regex(
      /^(?:\+84|0)(?:\d){9,10}$/,
      "Số điện thoại phải bắt đầu bằng 0 và chứa từ 10 đến 11 chữ số"
    ),
  Email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự"),
});

type BankEditValues = z.infer<typeof bankSchema>;

interface BankEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
  onSave: (newData: Omit<Bank, "id">) => void;
}

export default function BankEditDialog({
  open,
  onOpenChange,
  bank,
  onSave,
}: BankEditDialogProps) {
  const defaultValues: BankEditValues = bank
    ? {
        MaNH: bank.MaNH.trim(),
        TenNH: bank.TenNH,
        DiaChi: bank.DiaChi,
        Phone: bank.Phone,
        Email: bank.Email,
      }
    : {
        MaNH: "",
        TenNH: "",
        DiaChi: "",
        Phone: "",
        Email: "",
      };

  const form = useForm<BankEditValues>({
    resolver: zodResolver(bankSchema),
    defaultValues,
    values: defaultValues, // keep in sync if bank changed
    mode: "onChange",
  });

  function handleSubmit(values: BankEditValues) {
    // Explicitly cast to required type for type safety
    const bankData: Omit<Bank, "id"> = {
      MaNH: values.MaNH,
      TenNH: values.TenNH,
      DiaChi: values.DiaChi,
      Phone: values.Phone,
      Email: values.Email,
    };

    onSave(bankData);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin ngân hàng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin ngân hàng và nhấn lưu để xác nhận thay đổi
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="MaNH"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã ngân hàng</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập mã ngân hàng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="TenNH"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên ngân hàng</FormLabel>
                  <FormControl>
                    <Input placeholder="VietcomBank" {...field} />
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
                    <Input
                      placeholder="198 Trần Quang Khải, Hà Nội"
                      {...field}
                    />
                  </FormControl>
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
                    <Input placeholder="1900555577" {...field} />
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
                    <Input placeholder="info@bank.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Lưu thay đổi</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
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
