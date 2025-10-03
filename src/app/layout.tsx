// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Emeze Barbearia",
  description: "Sistema de Agendamentos",
  
  // 💡 CONFIGURAÇÃO DE ÍCONES
  icons: {
    // 1. Favicon Padrão (para abas do navegador e Android)
    icon: "/logo.png", 
    
    // 2. Apple Touch Icon (O ESSENCIAL PARA O IPHONE)
    // O iOS irá usar este logo quando o usuário adicionar o site à Tela de Início.
    // É recomendado o tamanho 180x180 para alta resolução.
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // 💡 CONFIGURAÇÃO PARA O COMPORTAMENTO DE APP (PWA no iOS)
  appleWebApp: {
    capable: true,                       // Habilita o modo de Tela Cheia (Standalone)
    title: "Emeze App",                   // O nome que aparecerá abaixo do ícone
    statusBarStyle: "black-translucent",  // Define o estilo da barra superior (hora, bateria, etc.)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}