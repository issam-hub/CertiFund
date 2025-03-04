import Image from "next/image";
import ProfileHeader from "./global/profileHeader";
import Link from "next/link";


export default function Header({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <>
        <header className="py-4 border-b border-slate-100 flex justify-between items-center px-4 sm:px-10">
            <div></div>
            <Link href={"/"}><Image src={"/logo.svg"} width={73} height={65} alt="logo" className="cursor-pointer"/></Link>
            <ProfileHeader/>
        </header>
        {children}
    </>
  )
}