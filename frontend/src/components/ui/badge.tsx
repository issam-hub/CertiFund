import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/app/_lib/utils"


const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        draft:
          "border-secondaryColor text-secondaryColor bg-secondary/10 hover:bg-secondary/20",
        "pending review":
          "border-yellow-500 text-yellow-500 bg-yellow-100 hover:bg-yellow-200",
        approved:
          "border-green-500 text-green-500 bg-green-100 hover:bg-green-200",
        rejected:
          "border-red-500 text-red-500 bg-red-100 hover:bg-red-200",
        live:
          "border-blue-500 text-blue-500 bg-blue-100 hover:bg-blue-200",
        completed:
          "border-gray-500 text-gray-500 bg-gray-100 hover:bg-gray-200",
        warning:
          "border-orange-500 text-orange-500 bg-orange-100 hover:bg-orange-200",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
