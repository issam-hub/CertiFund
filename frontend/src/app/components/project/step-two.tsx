import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Control, UseFormRegister } from "react-hook-form"

type StepTwoProps = {
  register: UseFormRegister<any>
  control: Control<any>
  errors: any
}

export default function StepTwo({ register, control,errors }: StepTwoProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fundingGoal" className="font-semibold">Funding Goal:</Label>
        <Input
          id="fundingGoal"
          type="number"
          {...register("funding_goal", {setValueAs:(value)=>value ===""?undefined:Number(value)})}
          placeholder="Enter funding goal"
        />
        {errors.funding_goal && <p className="text-xs text-red-600">* {errors.funding_goal.message}</p>}
      </div>
      <div>
        <Label htmlFor="deadline" className="font-semibold">Deadline:</Label>
        <Input
          id="deadline"
          {...register("deadline", {setValueAs:(value)=>value ===""?undefined:value})}
          type="datetime-local"
        />
        {errors.deadline && <p className="text-xs text-red-600">* {errors.deadline.message}</p>}
      </div>
    </div>
  )
}

