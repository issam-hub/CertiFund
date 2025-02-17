import MultiStepForm from "@/app/components/project/multi-step-form";

export default function page() {
  return (
    <div className="my-4">
        <div className="mx-auto text-center">
            <h1 className="font-bold text-3xl text-mainColor">Create your project</h1>
            <p className="text-sm text-slate-400 font-light mt-2">Fill out the information below to start your crowdfunding campaign</p>
        </div>
        <MultiStepForm/>
    </div>
  )
}
