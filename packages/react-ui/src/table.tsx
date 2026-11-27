import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type TableProps = ComponentProps<"table"> & {
	appearance?: "default" | "settings";
	scrollLabel?: string;
};

export function Table({ appearance = "default", scrollLabel, className, ...props }: TableProps) {
	return (
		<div
			data-slot="table-container"
			className="cn-table-container"
			role={scrollLabel ? "region" : undefined}
			aria-label={scrollLabel}
			tabIndex={scrollLabel ? 0 : undefined}
		>
			<table
				data-slot="table"
				data-appearance={appearance}
				className={cn("cn-table", appearance === "settings" && "cn-table-settings", className)}
				{...props}
			/>
		</div>
	);
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
	return <thead data-slot="table-header" className={cn("cn-table-header", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
	return <tbody data-slot="table-body" className={cn("cn-table-body", className)} {...props} />;
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
	return <tfoot data-slot="table-footer" className={cn("cn-table-footer", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn("cn-table-row has-aria-expanded:bg-muted/50", className)}
			{...props}
		/>
	);
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
	return <th data-slot="table-head" className={cn("cn-table-head", className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
	return <td data-slot="table-cell" className={cn("cn-table-cell", className)} {...props} />;
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
	return (
		<caption data-slot="table-caption" className={cn("cn-table-caption", className)} {...props} />
	);
}
