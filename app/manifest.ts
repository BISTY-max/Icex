import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi campus ICEX", short_name: "ICEX",
    description: "Asignaturas, documentos y calendario del campus ICEX.",
    start_url: "/campus", scope: "/", display: "standalone",
    background_color: "#ffffff", theme_color: "#ffffff",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }]
  };
}
