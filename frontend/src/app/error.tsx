'use client' // Error boundaries must be Client Components
 
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

    if(error.message === "This account doesn't have the necessary permissions to access this resource"){
        return (
            <div className="flex justify-center my-4 max-lg:flex-col max-sm:px-3">
            <Image src={"/403.svg"} height={700} width={500} alt="404" className="max-lg:w-1/2 max-lg:mx-auto"/>
            <div className="lg:ml-10 lg:mt-24 max-lg:mt-10 max-lg:text-center max-lg:mx-auto">
                <h1 className="text-mainColor text-5xl font-bold">Oh No! Error 403</h1>
                <p className="text-slate-400 font-light max-w-[500px] mt-3">Halt! You've been stopped at the border of this webpage. The digital police say 403 FORBIDDEN—you don't have the right clearance to enter. Either you need proper authorization, or this area is just off-limits. Move along, citizen!</p>
                <Link href={"/"} className="max-lg:mx-auto bg-secondaryColor text-white px-5 py-4 w-fit block rounded-md font-semibold mt-10">Back Home</Link>
            </div>
        </div>
        )
    }
 
  return (
    <div className='flex flex-col justify-center items-center my-4 max-lg:flex-col max-sm:px-3 text-center mt-[100px]'>
        <Image src={"/500.svg"} height={700} width={500} alt="404" className="max-lg:w-1/2 max-lg:min-w-[250px] max-lg:mx-auto"/>
        <div className="mt-10">
            <h1 className="text-mainColor text-[clamp(1.5rem,3vw,3rem)] font-bold">Oops! Something Went Wrong</h1>
            <p className="text-slate-400 font-light mt-3 max-w-[500px] mx-auto">
              Looks like our server took a coffee break.
              Don't worry, we're on it!

              Try refreshing the page or come back in a bit.
              If the issue persists, let us know—we'll kick the server back into shape!</p>
            <Button onClick={()=> reset()} className="bg-secondaryColor text-white hover:bg-secondaryColor mt-3">Try again <RefreshCw /></Button>
        </div>
    </div>
  )
}