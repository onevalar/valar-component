import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import React, { type ComponentProps } from "react";

export type NativeSelectProps = Omit<ComponentProps<"select">, "size"> & {
	size?: "default" | "sm";
};

export function NativeSelect({
	className,
	size = "default",
	multiple,
	...props
}: NativeSelectProps) {
	return (
		<div
			data-slot="native-select-wrapper"
			data-size={size}
			className={cn(
				"cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50",
				className
			)}
		>
			<select
				data-slot="native-select"
				data-size={size}
				multiple={multiple}
				className={cn(
					"cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed rtl:pr-2.5 rtl:pl-8",
					multiple && "h-auto! appearance-auto pe-2.5!"
				)}
				{...props}
			/>
			{!multiple && (
				<ChevronDownIcon
					data-slot="native-select-icon"
					className="cn-native-select-icon pointer-events-none absolute select-none rtl:right-auto rtl:left-2.5"
					aria-hidden="true"
				/>
			)}
		</div>
	);
}

export function NativeSelectOption({ className, ...props }: ComponentProps<"option">) {
	return (
		<option
			data-slot="native-select-option"
			className={cn("bg-[Canvas] text-[CanvasText]", className)}
			{...props}
		/>
	);
}

export function NativeSelectOptGroup({ className, ...props }: ComponentProps<"optgroup">) {
	return (
		<optgroup
			data-slot="native-select-optgroup"
			className={cn("bg-[Canvas] text-[CanvasText]", className)}
			{...props}
		/>
	);
}
