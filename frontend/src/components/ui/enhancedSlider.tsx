import { cn } from "@/app/_lib/utils"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

type EnhancedSliderProps = {
    defaultValue?: number[]
    onValueChange?: (value: number[]) => void
}

export default function EnhancedSlider({defaultValue, onValueChange}: EnhancedSliderProps) {
  const max = 100
  const skipInterval = 10 
  const ticks = [...Array(max + 1)].map((_, i) => i)

  return (
    <div>
    <Slider onValueChange={onValueChange} className="[&_span[data-slot=slider-range]]:bg-secondaryColor" defaultValue={defaultValue} max={max} step={10} />
    <span
        className="text-accentColor mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium"
        aria-hidden="true"
    >
        {ticks.map((_, i) => (
        <span
            key={i}
            className="flex w-0 flex-col items-center justify-center gap-2"
        >
            <span
            className={cn(
                "bg-muted-foreground/70 h-1 w-px",
                i % skipInterval !== 0 && "h-0.5"
            )}
            />
            <span className={cn(i % skipInterval !== 0 && "opacity-0")}>
            {i}%
            </span>
        </span>
        ))}
    </span>
    </div>
  )
}
