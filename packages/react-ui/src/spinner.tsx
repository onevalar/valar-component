import { cn } from "cn";
import { LoaderCircle } from "lucide-react";
import React, { type ComponentProps } from "react";

export type SpinnerProps = ComponentProps<typeof LoaderCircle> & { name?: string };

export function Spinner({ className, ...props }: SpinnerProps) {
	const explicitSize = /(?:^|\s)(?:\S+:)?!?(?:size|w|h)-/.test(className ?? "");
	return (
		<LoaderCircle
			data-slot="spinner"
			role="status"
			aria-label="加载中"
			className={cn("cn-spinner size-4 animate-spin motion-reduce:animate-none", className)}
			{...props}
			data-spinner-size-explicit={explicitSize ? "" : undefined}
		/>
	);
}
