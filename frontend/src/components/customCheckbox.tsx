import { useId } from "react"
import { Brush, Eraser, FolderX, MessageSquareX, Scissors, SwatchBook, User2, UserRoundMinus, UserRoundX, UserX } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Control, UseFormRegister } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"

interface CustomCheckBox {
  control: Control<any>
}

export default function CustomCheckBox({control}:CustomCheckBox) {
  const id = useId()

  const items = [
    { value: "delete-user", label: "Delete User", Icon: UserX },
    { value: "ban-user", label: "Ban User", Icon: UserRoundMinus },
    { value: "delete-comment", label: "Delete Comment", Icon: MessageSquareX },
    { value: "delete-project", label: "Delete Project", Icon: FolderX },
  ]

  return (
    <FormField
      control={control}
      name="note"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">Actions:</FormLabel>
          <FormControl>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={`${id}-${item.value}`}
                  className="border-input has-[[state=checked]]:border-red-500 relative flex cursor-pointer flex-col gap-4 rounded-md border p-4 shadow-xs outline-none"
                >
                  <div className="flex justify-between gap-2">
                    <Checkbox
                      id={`${id}-${item.value}`}
                      className="order-1 after:absolute after:inset-0"
                      {...field}
                    />
                    <item.Icon className="opacity-60 text-accentColor" size={16} aria-hidden="true" />
                  </div>
                  <Label htmlFor={`${id}-${item.value}`}>{item.label}</Label>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}