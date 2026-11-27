"use client";

import { cn } from "cn";
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from "lucide-react";
import { useSyncExternalStore, type ComponentProps, type CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

export { toast } from "sonner";
export type { ExternalToast } from "sonner";

export type ToasterProps = ComponentProps<typeof Sonner> & {
	appearance?: "default" | "workspace";
};

function subscribeTheme(update: () => void) {
	const observer = new MutationObserver(update);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
	return () => observer.disconnect();
}

export function Toaster({
	appearance = "default",
	theme,
	className,
	style,
	toastOptions,
	icons,
	...props
}: ToasterProps) {
	const resolvedTheme = useSyncExternalStore(
		subscribeTheme,
		() => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
		() => "light" as const
	);
	const workspace = appearance === "workspace";
	return (
		<Sonner
			theme={theme ?? resolvedTheme}
			className={cn("valar-toaster", workspace && "valar-workspace-toaster", className)}
			offset={workspace ? { right: 24, left: 24, bottom: 52 } : undefined}
			mobileOffset={workspace ? { right: 16, left: 16, bottom: 24 } : undefined}
			closeButton={workspace}
			style={
				{
					"--normal-bg": "var(--color-popover)",
					"--normal-text": "var(--color-popover-foreground)",
					"--normal-border": "var(--color-border)",
					...style,
				} as CSSProperties
			}
			toastOptions={{
				...toastOptions,
				classNames: {
					...toastOptions?.classNames,
					toast: cn("valar-toast", toastOptions?.classNames?.toast),
				},
			}}
			icons={{
				loading: <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />,
				success: <CircleCheck aria-hidden="true" className="size-4" />,
				error: <OctagonX aria-hidden="true" className="size-4" />,
				info: <Info aria-hidden="true" className="size-4" />,
				warning: <TriangleAlert aria-hidden="true" className="size-4" />,
				...icons,
			}}
			{...props}
		/>
	);
}
