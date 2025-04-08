"use client"
import Image from "next/image";
import ProfileHeader from "./global/profileHeader";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Header({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  const pathname = usePathname()
  return (
    <>
        <header className={`py-4 border-b border-slate-100 grid grid-cols-3 items-center px-4 sm:px-10 ${pathname.includes("admin") && "hidden"}`}>
            <div className="place-self-start self-center"></div>
            <Link href={"/"} className="mx-auto"><Image src={"/logo.svg"} width={73} height={65} alt="logo" className="cursor-pointer"/></Link>
            <ProfileHeader/>
        </header>
        {children}
    </>
  )
}