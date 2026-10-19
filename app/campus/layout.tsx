import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi campus | ICEX 2026–2027",
  description: "Asignaturas, documentación, calendario y tareas del MBA in International Management 2026–2027.",
  robots: { index: false, follow: false }
};

export default function CampusLayout({children}:{children:React.ReactNode}) {return children;}
