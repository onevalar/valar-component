"use client";

import React from "react";
import { switchPrimitive } from "@ui-sdk/core/switch";
import { usePart, usePrimitive } from "@ui-sdk/react/primitive";
import { SwitchThumb } from "@ui-sdk/react/switch";
import { cn } from "cn";
import { type ToggleProps, useToggleForm } from "./toggle-form.tsx";

export type SwitchProps = Omit<ToggleProps<boolean>, "children"> & {
	size?: "default" | "sm";
	appearance?: "default" | "settings";
};

export function Switch({
	className,
	size = "default",
	appearance = "default",
	checked,
	defaultChecked,
	onCheckedChange,
	disabled,
	readOnly,
	required,
	name,
	value = "on",
	form,
	ref,
	type = "button",
	onClick,
	onKeyDown,
	...props
}: SwitchProps) {
	const bridge = useToggleForm<boolean>(
		{
			checked,
			defaultChecked,
			onCheckedChange,
			disabled,
			required,
			name,
			value,
			form,
			ref,
			onClick,
		},
		false
	);
	const handle = usePrimitive(switchPrimitive, {
		checked: bridge.current,
		disabled,
		readOnly,
		required,
		onCheckedChange: bridge.change,
	});
	const root = usePart(
		handle,
		"root",
		{},
		{
			className: cn(
				"cn-switch peer group/switch relative inline-flex items-center transition-[background-color,opacity] duration-150 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 motion-reduce:transition-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
				className
			),
			...props,
			value,
			ref: bridge.rootRef,
			render: ({ onClick: _click, onKeyDown: _key, ...dom }, state) => (
				<button
					data-size={size}
					data-appearance={appearance}
					{...dom}
					type={type}
					data-state={state.checked ? "checked" : "unchecked"}
					onKeyDown={onKeyDown}
					onClick={(event) =>
						bridge.onClick(event, (native) => handle.api.toggle({ reason: "press", event: native }))
					}
				>
					<SwitchThumb
						data-slot="switch-thumb"
						className="cn-switch-thumb cn-switch-thumb-motion pointer-events-none block shrink-0 ring-0 duration-100 ease-out motion-reduce:transition-none"
						render={(thumb, state) => (
							<span {...thumb} data-state={state.checked ? "checked" : "unchecked"} />
						)}
					/>
				</button>
			),
		},
		"button"
	);
	return (
		<>
			{root}
			{bridge.hiddenInput}
		</>
	);
}
