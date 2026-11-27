"use client";

import * as React from "react";
import { checkbox, type CheckboxGroupOptions, type CheckedState } from "@ui-sdk/core/checkbox";
import {
	Checkbox as SdkCheckbox,
	CheckboxGroup as SdkCheckboxGroup,
	CheckboxIndicator,
} from "@ui-sdk/react/checkbox";
import { renderElement, usePart, usePrimitive } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { CheckIcon, MinusIcon } from "lucide-react";
import { type ToggleProps, useToggleForm } from "./toggle-form.tsx";

export type CheckboxProps = Omit<ToggleProps<CheckedState>, "onCheckedChange"> & {
	asChild?: boolean;
	parent?: boolean;
	onCheckedChange?: { bivarianceHack(checked: CheckedState): void }["bivarianceHack"];
};

export type CheckboxGroupProps<T extends string = string> = CheckboxGroupOptions<T> &
	Omit<React.ComponentPropsWithRef<"div">, "defaultValue" | "onChange" | "onSelect">;

// This context selects the SDK's group-aware item. Selection, registration,
// validation and reset all belong to the SDK group, not to this context.
const InGroup = React.createContext(false);

const checkboxClass =
	"cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50";

function dataState(state: { checked: boolean; indeterminate: boolean }) {
	return state.indeterminate ? "indeterminate" : state.checked ? "checked" : "unchecked";
}

function checkboxChild(asChild: boolean | undefined, children: React.ReactNode) {
	if (!asChild) return undefined;
	if (!React.isValidElement(children))
		throw new Error("Checkbox asChild expects a single React element");
	return children;
}

function Indicator() {
	return (
		<CheckboxIndicator
			data-slot="checkbox-indicator"
			className="cn-checkbox-indicator grid place-content-center text-current transition-none"
			render={(props, state) => (
				<span
					{...props}
					data-state={dataState(state)}
					hidden={!state.checked && !state.indeterminate}
				>
					{state.indeterminate ? (
						<MinusIcon aria-hidden="true" />
					) : (
						<CheckIcon aria-hidden="true" />
					)}
				</span>
			)}
		/>
	);
}

function StandaloneCheckbox({
	className,
	children,
	asChild,
	parent: _parent,
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
}: CheckboxProps) {
	const bridge = useToggleForm<CheckedState>(
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
		false,
		true
	);
	const handle = usePrimitive(checkbox, {
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
			className: cn(checkboxClass, className),
			...props,
			value,
			ref: bridge.rootRef,
			render: ({ onClick: _click, onKeyDown: _key, ...dom }, state) =>
				renderElement(
					"button",
					{
						...dom,
						type,
						"data-state": dataState(state),
						children: asChild ? undefined : (children ?? <Indicator />),
						onClick: (event: React.MouseEvent<HTMLButtonElement>) =>
							bridge.onClick(event, (native) =>
								handle.api.toggle({ reason: "press", event: native })
							),
						onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
							onKeyDown?.(event);
							if (event.key === "Enter") event.preventDefault();
						},
					},
					checkboxChild(asChild, children),
					state
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

function GroupCheckbox({
	className,
	children,
	asChild,
	value,
	onCheckedChange,
	onKeyDown,
	onChange,
	onSelect,
	defaultValue,
	...props
}: CheckboxProps) {
	return (
		<SdkCheckbox
			data-slot="checkbox"
			className={cn(checkboxClass, className)}
			{...props}
			value={value === undefined ? undefined : String(value)}
			onCheckedChange={onCheckedChange && ((next) => onCheckedChange(next))}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				if (event.key === "Enter") event.preventDefault();
			}}
			render={(dom, state) =>
				renderElement(
					"button",
					{
						...dom,
						"data-state": dataState(state),
						value,
						onChange,
						onSelect,
						defaultValue,
						children: asChild ? undefined : (children ?? <Indicator />),
					},
					checkboxChild(asChild, children),
					state
				)
			}
		/>
	);
}

export function Checkbox(props: CheckboxProps) {
	return React.useContext(InGroup) ? (
		<GroupCheckbox {...props} />
	) : (
		<StandaloneCheckbox {...props} />
	);
}

export function CheckboxGroup<T extends string = string>({
	children,
	...props
}: CheckboxGroupProps<T>) {
	return (
		<InGroup.Provider value={true}>
			<SdkCheckboxGroup data-slot="checkbox-group" {...props}>
				{children}
			</SdkCheckboxGroup>
		</InGroup.Provider>
	);
}
