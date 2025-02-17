import { Toaster } from "@/components/ui/toaster";
import Header from "./components/header";
import "./globals.css";
import { Inter, Montserrat } from "next/font/google";

const inter = Inter({ subsets: ["latin"],variable:"--font-inter",weight:["300","400","500","600","700", "800"]});
const montserrat = Montserrat({subsets:["latin"], variable:"--font-montserrat", weight:["600", '700', "800"]})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${montserrat.variable}`}
      >
        <Header>
          {children}
        </Header>
        <Toaster/>
      </body>
    </html>
  );
}
