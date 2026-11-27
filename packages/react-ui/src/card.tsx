import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type CardSize = "default" | "sm" | "settings";
export type CardProps = ComponentProps<"div"> & { size?: CardSize };

export function Card({ className, size = "default", ...props }: CardProps) {
	return (
		<div
			data-slot="card"
			data-size={size}
			className={cn(
				"cn-card group/card flex min-w-0 flex-col scheme-light dark:scheme-dark",
				size === "settings" && "cn-card-settings",
				className
			)}
			{...props}
		/>
	);
}

export function CardHeader({ className, children, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"cn-card-header group/card-header @container/card-header grid min-w-0",
				className
			)}
			{...props}
		>
			<div className="grid min-w-0 auto-rows-min grid-cols-[minmax(0,1fr)] items-start gap-[inherit] @min-[17rem]/card-header:has-[>[data-slot=card-action]]:grid-cols-[minmax(0,1fr)_minmax(0,40%)]">
				{children}
			</div>
		</div>
	);
}

export function CardTitle({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn("cn-font-heading cn-card-title", className)}
			{...props}
		/>
	);
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
	return (
		<p data-slot="card-description" className={cn("cn-card-description", className)} {...props} />
	);
}

export function CardAction({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"cn-card-action order-last max-w-full min-w-0 self-start justify-self-start @min-[17rem]/card-header:col-start-2 @min-[17rem]/card-header:row-span-2 @min-[17rem]/card-header:row-start-1 @min-[17rem]/card-header:justify-self-end",
				className
			)}
			{...props}
		/>
	);
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="card-content" className={cn("cn-card-content", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn("cn-card-footer flex items-center", className)}
			{...props}
		/>
	);
}
