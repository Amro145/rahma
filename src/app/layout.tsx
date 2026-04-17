import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-sans", // Setting as --font-sans lets Tailwind inherit it by default for general elements
	subsets: ["latin"],
	display: "swap",
});

const cairo = Cairo({
	variable: "--font-cairo",
	subsets: ["arabic", "latin"],
	display: "swap",
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
		<html lang="en" dir="ltr">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${inter.variable} ${cairo.variable} antialiased bg-slate-50`}>
				{children}
			</body>
		</html>
	);
}
