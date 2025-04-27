import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useEffect } from "react";

const editAllocationSchema = z.object({
  MaNDT: z.string().min(1, "Mã nhà đầu tư không được để trống"),
  TenNDT: z.string().min(1, "Tên nhà đầu tư không được để trống"),
  SoLuong: z
    .number()
    .min(1, "Số lượng phải lớn hơn 0")
    .refine((val) => val % 100 === 0, {
      message: "Số lượng phải là bội số của 100",
    }),
});

type EditAllocationFormValues = z.infer<typeof editAllocationSchema>;

interface EditAllocationFormProps {
  open: boolean;
  onClose: () => void;
  allocation: EditAllocationFormValues;
  onSubmit: (updatedAllocation: EditAllocationFormValues) => void;
}

const EditAllocationForm = ({
  open,
  onClose,
  allocation,
  onSubmit,
}: EditAllocationFormProps) => {
  const form = useForm<EditAllocationFormValues>({
    resolver: zodResolver(editAllocationSchema),
    defaultValues: allocation || {
      MaNDT: "",
      TenNDT: "",
      SoLuong: 0,
    },
    mode: "onChange",
  });

  // Reset form khi allocation thay đổi
  useEffect(() => {
    if (allocation) {
      form.reset(allocation);
    }
  }, [allocation, form]);

  const handleFormSubmit = (data: EditAllocationFormValues) => {
    onSubmit(data);
    toast.success("Cập nhật phân bổ thành công");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phân bổ</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* Mã nhà đầu tư */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã nhà đầu tư
            </label>
            <Controller
              name="MaNDT"
              control={form.control}
              render={({ field }) => (
                <Input {...field} disabled className="cursor-not-allowed" />
              )}
            />
          </div>

          {/* Tên nhà đầu tư */}
          <div>
            <label className="block text-sm font-medium">Tên nhà đầu tư</label>
            <Controller
              name="TenNDT"
              control={form.control}
              render={({ field }) => (
                <Input {...field} disabled className="cursor-not-allowed" />
              )}
            />
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium">Số lượng</label>
            <Controller
              name="SoLuong"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  placeholder="Nhập số lượng"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                  className={
                    form.formState.errors.SoLuong ? "border-red-500" : ""
                  }
                />
              )}
            />
            {form.formState.errors.SoLuong && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.SoLuong.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAllocationForm;
