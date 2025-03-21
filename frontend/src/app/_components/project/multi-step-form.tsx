"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import StepOne from "./step-one"
import StepTwo from "./step-two"
import StepIndicator from "./step-indicator"
import { useForm } from "react-hook-form"
import { createProjectSchema, CreateProjectSchema } from "@/app/_lib/schemas/project"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { createProject } from "@/app/_actions/projects"
import { useRouter } from "next/navigation"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/shared"


export default function MultiStepForm() {
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step === 1) {
      
    }
    setStep((prevStep) => prevStep + 1)
  }

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1)
  }

  const { toast } = useToast()
  const router = useRouter()

  const user = useAtomValue(userAtom)

  if(!user){
    toast({
      title: "Warning",
      description: "You need to be signed up in order to create projects",
      variant: "warning",
    });
    router.push("/login", {scroll:true})
  }

  const onSubmit = async (data: CreateProjectSchema) => {   
    let toBeSent = data 
    toBeSent["creator_id"] = user?.id as string

    const result = await createProject(data);
    if(result.status) {
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "Project is created successfully",
        variant: "default",
      });

      router.push(`/projects/${result['project']['project_id']}`, {scroll:true})
      
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
  });


  return (
    <div className="w-full max-w-2xl mx-auto mt-10  ">
      <StepIndicator currentStep={step} errors={errors} />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} id="myform">
            {step === 1 && <StepOne register={register} control={control} errors={errors}/>}
            {step === 2 && <StepTwo register={register} control={control} errors={errors}/>}
          </form>
        </CardContent>
        <CardFooter className={`flex justify-between ${step < 2 && "flex-end"}`}>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {step < 2 ? (
            <Button className="bg-secondaryColor hover:bg-secondaryColor" type="button" onClick={(e)=>{
              e.preventDefault()
              handleNext()
            }}>
              Next
            </Button>
          ) : (
            <Button disabled={isSubmitting} className="bg-secondaryColor hover:bg-secondaryColor disabled:bg-lightAccentColor" type="submit" form="myform">
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

