import { Archivo, Instrument_Serif } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  preload: false,
  variable: "--font-instrument",
  display: "swap",
});

export const fontVars = `${archivo.variable} ${instrument.variable}`;
export const fontsD = fontVars;
