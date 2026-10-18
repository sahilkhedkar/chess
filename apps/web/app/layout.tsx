import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./win.css";
import "./preview.css";
import "./responsive.css";
export const metadata: Metadata = { title: "Chessroom - Play together", description: "A quiet place for a good game of chess." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
