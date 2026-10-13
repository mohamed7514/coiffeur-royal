import { Bodoni_Moda, Manrope } from "next/font/google";

const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
export const fontsA = `${bodoni.variable} ${manrope.variable}`;
