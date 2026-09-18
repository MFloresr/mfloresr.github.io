import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mario Flores | Desarrollador web full-stack",
  description: "Portfolio de Mario Flores Rodríguez, desarrollador web full-stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
