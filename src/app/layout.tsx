import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
	subsets: ["arabic"],
	weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
	variable: "--font-cairo",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "RAHMA Dashboard",
	description: "Professional Charity and Financial Tracking Platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`}>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className="antialiased bg-slate-50 font-sans">
				{children}
			</body>
		</html>
	);
}
