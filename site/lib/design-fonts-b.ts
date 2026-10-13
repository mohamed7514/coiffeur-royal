import { Anton, Archivo, Azeret_Mono } from "next/font/google";

// Keep this demo independent from the production layout's font module.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap", preload: false });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap", preload: false });
const azeret = Azeret_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono-azeret", display: "swap", preload: false });
export const fontsB = `${anton.variable} ${archivo.variable} ${azeret.variable}`;
