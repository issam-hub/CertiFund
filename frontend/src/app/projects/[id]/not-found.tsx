import Image from "next/image";
import Link from "next/link";

 
export default function NotFound() {
  return (
    <div className="flex justify-center my-4 max-lg:flex-col max-sm:px-3">
        <Image src={"/404.svg"} height={700} width={500} alt="404" className="max-lg:w-1/2 max-lg:mx-auto"/>
        <div className="lg:ml-10 lg:mt-24 max-lg:mt-10 max-lg:text-center max-lg:mx-auto">
            <h1 className="text-mainColor text-5xl font-bold">Oh No! Error 404</h1>
            <p className="text-slate-400 font-light max-w-[500px] mt-3">This looks like an uncharted land, a mysterious and untouched place where no traveler has ever set foot before. The maps don’t mark it, the stars don’t guide to it, and even the wind whispers uncertainty.</p>
            <Link href={"/"} className="max-lg:mx-auto bg-secondaryColor text-white px-5 py-4 w-fit block rounded-md font-semibold mt-10">Seil to Homeland</Link>
        </div>
    </div>
  )
}