import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICEX | Proyecto de internacionalización",
  description: "Un espacio para presentar el proyecto ICEX y sus próximos pasos."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
