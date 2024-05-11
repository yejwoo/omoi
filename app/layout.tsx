import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AuthSession from "@/AuthSession";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "omoi",
  description: "social media for japan travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthSession>
            <Header />
            {children}
          </AuthSession>
        </AuthProvider>
      </body>
    </html>
  );
}
