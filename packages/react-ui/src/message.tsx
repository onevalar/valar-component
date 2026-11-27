// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type MessageAlign = "start" | "end";
export type MessageProps = ComponentProps<"div"> & { align?: MessageAlign };

export function Message({ className, align = "start", ...props }: MessageProps) {
	return (
		<div
			data-slot="message"
			data-align={align}
			className={cn(
				"cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse",
				className
			)}
			{...props}
		/>
	);
}

export function MessageGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="message-group"
			className={cn("cn-message-group flex min-w-0 flex-col", className)}
			{...props}
		/>
	);
}

export function MessageAvatar({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="message-avatar"
			className={cn(
				"cn-message-avatar flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted",
				className
			)}
			{...props}
		/>
	);
}

export function MessageContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="message-content"
			className={cn("cn-message-content flex w-full min-w-0 flex-col wrap-break-word", className)}
			{...props}
		/>
	);
}

export function MessageHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="message-header"
			className={cn("cn-message-header flex max-w-full min-w-0 items-center", className)}
			{...props}
		/>
	);
}

export function MessageFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="message-footer"
			className={cn(
				"cn-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end",
				className
			)}
			{...props}
		/>
	);
}
