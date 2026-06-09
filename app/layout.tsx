import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "차차그린하우스",
  description: "주소 기반 내한성 정보를 제공하는 식물 판매 서비스",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
