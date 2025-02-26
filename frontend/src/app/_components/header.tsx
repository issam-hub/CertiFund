import Image from "next/image";


export default function Header({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <>
        <header className="py-4 border-b border-slate-100">
            <Image src={"/logo.svg"} width={73} height={65} alt="logo" className="mx-auto cursor-pointer"/>
        </header>
        {children}
    </>
  )
}