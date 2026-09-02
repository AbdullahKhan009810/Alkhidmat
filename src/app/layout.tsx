import type { Metadata } from "next";
import { Poppins, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const notoUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-urdu",
});

export const metadata: Metadata = {
  title: "Muawin — Voice Welfare Assistant",
  description:
    "Voice-powered welfare assistance in English and Urdu by Al Khidmat Foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${notoUrdu.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
