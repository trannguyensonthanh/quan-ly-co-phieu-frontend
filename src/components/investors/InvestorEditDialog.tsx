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
  DialogTrigger,
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
import { User } from "@/utils/types";

const investorSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải theo định dạng YYYY-MM-DD"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 ký tự"),
  idNumber: z.string().min(9, "Số CMND phải có ít nhất 9 ký tự"),
  gender: z.enum(["Nam", "Nữ"]),
});

type InvestorEditValues = z.infer<typeof investorSchema>;

interface InvestorEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investor: User | null;
  onSave: (newData: Omit<User, "id" | "role">) => void;
}

export default function InvestorEditDialog({
  open,
  onOpenChange,
  investor,
  onSave,
}: InvestorEditDialogProps) {
  // If not investor selected, do not render dialog
  const defaultValues: InvestorEditValues = investor
    ? {
        username: investor.username,
        fullName: investor.fullName,
        email: investor.email,
        birthDate: investor.birthDate,
        address: investor.address,
        phone: investor.phone,
        idNumber: investor.idNumber,
        gender: investor.gender,
      }
    : {
        username: "",
        fullName: "",
        email: "",
        birthDate: "",
        address: "",
        phone: "",
        idNumber: "",
        gender: "Nam",
      };

  const form = useForm<InvestorEditValues>({
    resolver: zodResolver(investorSchema),
    defaultValues,
    values: defaultValues, // keep in sync if investor changed!
    mode: "onChange",
  });

  function handleSubmit(values: InvestorEditValues) {
    // The issue is here - we need to ensure all properties are required
    // By explicitly casting to the required type, we're ensuring type safety
    const userData: Omit<User, "id" | "role"> = {
      username: values.username,
      fullName: values.fullName,
      email: values.email,
      birthDate: values.birthDate,
      address: values.address,
      phone: values.phone,
      idNumber: values.idNumber,
      gender: values.gender,
    };

    onSave(userData);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa nhà đầu tư</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhà đầu tư và nhấn lưu để xác nhận thay đổi.
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
                      <Input placeholder="investor123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
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
                name="email"
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
                name="birthDate"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Đường ABC, Quận XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
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
                name="idNumber"
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
