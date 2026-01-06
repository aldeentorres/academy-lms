import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: "Academy LMS Platform",
  description: "Modern learning management system with courses, quizzes, and assignments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
