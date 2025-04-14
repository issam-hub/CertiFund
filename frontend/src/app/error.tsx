'use client' // Error boundaries must be Client Components
 
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
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}