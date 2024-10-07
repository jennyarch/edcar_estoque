"use client"
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/Auth";
import { ProductsProvider } from "@/context/ProductsProvider";
import { PartsProvider} from '@/context/PartsProvider';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children}: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProductsProvider>
            <PartsProvider>
              {children}
            </PartsProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  ) 
}
