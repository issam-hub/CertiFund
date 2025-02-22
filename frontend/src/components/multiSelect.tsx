import MultipleSelector, { Option } from "@/components/ui/multipleSelector";
import { Control, Controller, UseFormRegister } from "react-hook-form";

const categoriesList: {value:string, label:string}[] = [
  {value:"technology",label:"Technology"}, 
  {value:"art",label:"Art"}, 
  {value:"music",label:"Music"}, 
  {value:"games",label:"Games"}, 
  {value:"film & video",label:"Film & Video"}, 
  {value:"publishing & writing",label:"Publishing & Writing"}, 
  {value:"design",label:"Design"}, 
  {value:"food & craft",label:"Food & Craft"}, 
  {value:"social good",label:"Social good"}, 
  {value:"miscellaneous",label:"Miscellaneous"}
];

export function renderCategories(categories: string[]) {
  return categories.map((category) => {
    const categoriesObjs = categoriesList.find((cat) => cat.value === category);
    return categoriesObjs
  })
}

interface MultiSelectProps {
  register: UseFormRegister<any>
  control: Control<any>
  errors: any,
  disableEdit?: boolean
}

export default function MultiSelect({register, control, errors, disableEdit}: MultiSelectProps) {
  return (
    <>
      <Controller 
        control={control}
        name="categories"
        rules={{ 
          required: "Please select at least one category",
          validate: (value) => {
            if (!value || value.length === 0) {
              return "Please select at least one category";
            }
            return true;
          }
        }}
        render={({field}) => (
          <MultipleSelector
            commandProps={{
              label: "Select categories",
            }}
            disabled={disableEdit}
            defaultOptions={categoriesList}
            placeholder="Select categories"
            emptyIndicator={<p className="text-center text-sm">No results found</p>}
            value={field.value ? renderCategories(field.value) as Option[]:[]}
            onChange={(options) => {
              field.onChange(options.map((option) => option.value));
            }}
          />
        )}
      />
      {errors.categories && <p className="text-xs text-red-600">* {errors.categories.message}</p>}
    </>
  );
}