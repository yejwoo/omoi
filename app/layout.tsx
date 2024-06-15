import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AuthSession from "@/AuthSession";
import { AuthProvider } from "./context/AuthContext";
import QueryProvider from "@/components/QueryClientProvider";

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
        <QueryProvider>
          <AuthProvider>
            <AuthSession>
              <Header />
              {children}
            </AuthSession>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
