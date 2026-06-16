import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnSphere AI — AI-Powered Study Assistant",
  description:
    "Transform your study materials into an interactive AI-powered learning experience. Upload PDFs, ask questions, generate quizzes, and track your progress with LearnSphere AI.",
  keywords: [
    "AI study assistant",
    "PDF chat",
    "quiz generator",
    "learning platform",
    "RAG",
    "AI tutor",
  ],
  openGraph: {
    title: "LearnSphere AI — AI-Powered Study Assistant",
    description:
      "Transform your study materials into an interactive AI-powered learning experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
