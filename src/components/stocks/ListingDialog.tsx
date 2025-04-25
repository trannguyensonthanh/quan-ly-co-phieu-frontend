import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Stock } from "@/utils/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const listingStockSchema = z.object({
  GiaTC: z.coerce.number().min(1, "Giá tham chiếu phải lớn hơn 0"),
});

type ListingStockFormValues = z.infer<typeof listingStockSchema>;

interface ListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ListingStockFormValues) => void;
  stock: Stock | null;
}

export function ListingDialog({
  open,
  onOpenChange,
  onSubmit,
  stock,
}: ListingDialogProps) {
  const form = useForm<ListingStockFormValues>({
    resolver: zodResolver(listingStockSchema),
    defaultValues: {
      GiaTC: 0,
    },
  });

  if (!stock) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Niêm yết cổ phiếu {stock.MaCP}</DialogTitle>
          <DialogDescription className="text-yellow-600 mt-2">
            Lưu ý: Sau khi niêm yết, bạn sẽ không thể:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Xóa cổ phiếu này</li>
              <li>Hoàn tác các thay đổi liên quan đến cổ phiếu</li>
              <li>Thay đổi trạng thái về "Chưa niêm yết"</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="GiaTC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá tham chiếu (VNĐ)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Xác nhận niêm yết</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
