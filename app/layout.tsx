import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickBrain - Smart Flashcard Learning",
  description: "Create and study flashcards efficiently with our intelligent system. Generate flashcard sets instantly using AI assistance and share with friends to enhance your learning experience.",
  keywords: ["flashcards", "learning", "education", "study", "AI", "collaborative learning"],
  authors: [{ name: "QuickBrain" }],
  creator: "QuickBrain",
  publisher: "QuickBrain",
  openGraph: {
    title: "QuickBrain - Smart Flashcard Learning",
    description: "Create and study flashcards efficiently with our intelligent system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickBrain - Smart Flashcard Learning",
    description: "Create and study flashcards efficiently with our intelligent system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
