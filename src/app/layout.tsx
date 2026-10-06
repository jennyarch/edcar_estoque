import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "EdCar Estoque",
    template: "%s · EdCar Estoque",
  },
  description:
    "Sistema interno de controle de estoque da loja EdCar — diafragmas e peças de reposição do hidrovácuo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
