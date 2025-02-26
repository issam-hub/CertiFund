import { Input } from "@/components/ui/input"
import { Control, Controller, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MultiSelect from "@/components/multiSelect";

type StepOneProps = {
  register: UseFormRegister<any>
  control: Control<any>
  errors: any
}

export default function StepOne({register, control, errors}: StepOneProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title" className="font-semibold">Title:</Label>
        <Input 
          id="title"
          {...register("title", {setValueAs:(value)=>value ===""?undefined:value})}
          placeholder="Enter the project title"
          />
        {errors.title && <p className="text-xs text-red-600">* {errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description" className="font-semibold">Description:</Label>
        <Textarea
          id="description"
          className="min-h-28"
          {...register("description", {setValueAs:(value)=>value ===""?undefined:value})}
          placeholder="Enter the project description"
        />
        {errors.description && <p className="text-xs text-red-600">* {errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="category" className="font-semibold">Categories:</Label>
        <MultiSelect register={register} control={control} errors={errors}/>
        {/* <Controller
          control={control}
          {...register("category")}
          render={({field:{onChange}})=>(
          <Select onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="film">Film</SelectItem>
              <SelectItem value="games">Games</SelectItem>
              <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
          )}
        />
        {errors.category && <p className="text-xs text-red-600">* {errors.category.message}</p>} */}
      </div>
    </div>
  )
}

