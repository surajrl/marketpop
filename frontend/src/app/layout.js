import { Inter } from "next/font/google";
import { cn } from "@/utils";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";
import Template from "@/app/template";
import { SocketProvider } from "@/context/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MarketPOP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn("relative h-full font-sans antialiased", inter.className)}
      >
        <main className="relative flex flex-col min-h-screen">
          <NavBar />
          <Template>
            <SocketProvider>
              <div className="flex-grow flex-1">{children}</div>
            </SocketProvider>
          </Template>
          <Footer />
        </main>

        {/* Notifications */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
