"use client";
import AntiDebugger from "@/components/AntiDebugger";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NextUIProvider>
			<Toaster richColors />
			<NextThemesProvider attribute="class" forcedTheme="dark">
				{children}
			</NextThemesProvider>
		</NextUIProvider>
	);
}
