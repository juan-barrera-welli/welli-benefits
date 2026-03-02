import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { ClientAuthGuard } from "@/components/auth/ClientAuthGuard";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Welli Benefits - Tu bienestar corporativo",
  description: "Descubre tus beneficios, proveedores médicos y gestiona tu bienestar con Welli Benefits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} antialiased min-h-screen bg-slate-50 relative overflow-x-hidden`}
      >
        {/* Ambient Background Glows */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4C7DFF]/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8C65C9]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#FFC800]/3 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        <ClientAuthGuard>
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
        </ClientAuthGuard>
      </body>
    </html>
  );
}
