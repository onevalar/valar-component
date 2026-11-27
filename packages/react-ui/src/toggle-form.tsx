"use client";

import * as React from "react";
import { mergeProps } from "@ui-sdk/react/primitive";

type CheckedState = boolean | "indeterminate";

export type ToggleProps<T extends CheckedState> = Omit<
	React.ComponentPropsWithRef<"button">,
	"defaultChecked"
> & {
	checked?: T;
	defaultChecked?: T;
	onCheckedChange?: (checked: T) => void;
	required?: boolean;
	readOnly?: boolean;
};

type Press = { requested: boolean; stopped: boolean };

// The SDK owns activation and ARIA. Use a native input here instead of the SDK
// input part: React's delegated checkbox onChange needs a click, not the SDK's
// native input/change pair. Keep the input out of the tab order and layout.
export function useToggleForm<T extends CheckedState>(
	{
		checked,
		defaultChecked,
		onCheckedChange,
		name,
		value = "on",
		form,
		required,
		disabled,
		onClick,
		ref,
	}: ToggleProps<T>,
	empty: T,
	checkbox = false
) {
	const initial = React.useRef(checked ?? defaultChecked ?? empty).current;
	const [local, setLocal] = React.useState(initial);
	const current = checked ?? local;
	const [button, setButton] = React.useState<HTMLButtonElement | null>(null);
	const input = React.useRef<HTMLInputElement>(null);
	const [press, setPress] = React.useState<Press | null>(null);
	const previous = React.useRef(current);
	const reported = React.useRef(press);
	const pending = React.useRef<Press | null>(null);
	const mute = React.useRef(false);
	const rootRef = React.useMemo(() => mergeProps({ ref: setButton }, { ref }).ref, [ref]);
	const participates = !button || Boolean(form || button.closest("form"));

	function change(next: T) {
		if (next === current) return;
		if (checked === undefined) setLocal(next);
		else onCheckedChange?.(next);
	}

	const reset = React.useEffectEvent(() => change(initial));
	React.useEffect(() => {
		// Preserve Radix's distinction: Checkbox listens to its visible button's
		// owner, while Switch also listens to an explicitly associated form.
		const owner = checkbox ? button?.form : input.current?.form;
		const listener = () => reset();
		owner?.addEventListener("reset", listener);
		return () => owner?.removeEventListener("reset", listener);
	}, [button, checkbox, form, checked]);

	const changeAfterCommit = React.useEffectEvent((next: T) => {
		if (checked === undefined) onCheckedChange?.(next);
	});
	React.useEffect(() => {
		const changed = previous.current !== current;
		previous.current = current;
		const click = reported.current === press ? null : press;
		reported.current = press;
		const node = input.current;
		if (node) {
			node.indeterminate = current === "indeterminate";
			if (changed || node.checked !== (current === true)) {
				const view = node.ownerDocument.defaultView;
				const setter =
					view && Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "checked")?.set;
				setter?.call(node, current === true);
			}
			if (click || changed) {
				const request = click ?? (pending.current?.requested === current ? pending.current : null);
				pending.current = changed ? null : click;
				mute.current = !click;
				// A plain Event bubbles through React without activating the input.
				const ClickEvent = node.ownerDocument.defaultView?.Event ?? Event;
				node.dispatchEvent(new ClickEvent("click", { bubbles: !request?.stopped }));
				mute.current = false;
			}
		}
		if (changed) changeAfterCommit(current);
	}, [current, participates, press]);

	return {
		current,
		change,
		rootRef,
		onClick(event: React.MouseEvent<HTMLButtonElement>, toggle: (event: MouseEvent) => boolean) {
			onClick?.(event);
			if (event.defaultPrevented) return;
			if (toggle(event.nativeEvent) && input.current) {
				setPress({ requested: current !== true, stopped: event.isPropagationStopped() });
				event.stopPropagation();
			}
		},
		hiddenInput: participates && (
			<input
				type="checkbox"
				ref={input}
				aria-hidden
				tabIndex={-1}
				defaultChecked={(defaultChecked ?? initial) === true}
				name={name}
				value={value}
				required={required}
				disabled={disabled}
				form={form}
				onClick={(event) => {
					if (mute.current) event.stopPropagation();
				}}
				style={{
					opacity: 0,
					position: "absolute",
					pointerEvents: "none",
					width: 1,
					height: 1,
					margin: 0,
				}}
			/>
		),
	};
}
