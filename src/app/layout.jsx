import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
const archivo = Archivo({
    variable: "--font-archivo",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});
const archivoBlack = Archivo_Black({
    variable: "--font-archivo-black",
    subsets: ["latin"],
    weight: "400",
});
export const metadata = {
    title: "HCBB Pathway",
    description: "The Pathway Program — East & West Divisions",
};
export default function RootLayout({ children }) {
    return (<html lang="en" className={`${archivo.variable} ${archivoBlack.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>);
}
