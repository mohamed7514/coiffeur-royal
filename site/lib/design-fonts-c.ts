import { Chivo, JetBrains_Mono } from "next/font/google";

const chivo = Chivo({ subsets: ["latin"], variable: "--font-chivo", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
export const fontsC = `${chivo.variable} ${jetbrains.variable}`;
