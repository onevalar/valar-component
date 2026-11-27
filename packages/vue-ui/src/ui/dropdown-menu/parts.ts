import { CheckIcon, ChevronRightIcon, MinusIcon } from "@lucide/vue";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import { computed, defineComponent, h, inject, mergeProps, provide, ref } from "vue";
import { Kbd } from "../kbd/index.js";
import type {
	DropdownMenuCheckboxItemProps,
	DropdownMenuItemProps,
	DropdownMenuPortalProps,
	DropdownMenuRadioItemProps,
} from "reka-ui";
import type { Component, HTMLAttributes, InjectionKey, PropType, Ref } from "vue";

type NativePart = Component & (new () => { $props: object });
type NativeProps<T extends NativePart> = InstanceType<T>["$props"];
type StyledProps = { class?: HTMLAttributes["class"] };
type SelectListener = (event: Event) => void;
const selectListener = Function as PropType<SelectListener>;

function enabled(value: unknown) {
	return value === true || value === "";
}

function usesChild(attrs: Record<string, unknown>) {
	return enabled(attrs.asChild ?? attrs["as-child"]);
}

// Keep the public native props/slots and forward the element through the wrapper.
export function styledPart<T extends NativePart>(
	part: T,
	slot: string,
	classes?: string,
	attrs?: object
): T {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		setup(_, { attrs: passed, slots }) {
			const { forwardRef } = useForwardExpose();
			return () =>
				h(
					part,
					{
						...attrs,
						...passed,
						ref: forwardRef,
						"data-slot": slot,
						class: cn(classes, passed.class as string),
					},
					slots
				);
		},
	}) as T;
}

export function menuLabel<T extends NativePart>(part: T, slot: string, classes: string) {
	return defineComponent(
		(props: NativeProps<T> & { inset?: boolean }, { attrs, slots }) => {
			const { forwardRef } = useForwardExpose();
			return () =>
				h(
					part,
					{
						...attrs,
						ref: forwardRef,
						"data-slot": slot,
						"data-inset": enabled(props.inset) ? "" : undefined,
						class: cn(classes, attrs.class as string),
					},
					slots
				);
		},
		{ name: slot, inheritAttrs: false, props: ["inset"] }
	);
}

export function menuShortcut(slot: string, classes: string) {
	return styledPart(Kbd, slot, classes, { appearance: "inline" });
}

const row =
	"flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export function menuItem(part: NativePart, slot: string, classes: string) {
	return defineComponent(
		(
			props: DropdownMenuItemProps &
				StyledProps & {
					inset?: boolean;
					variant?: "default" | "destructive";
					closeOnSelect?: boolean;
					onSelect?: SelectListener;
				},
			{ attrs, slots }
		) => {
			const { forwardRef } = useForwardExpose();
			return () =>
				h(
					part,
					{
						...attrs,
						ref: forwardRef,
						"data-slot": slot,
						"data-variant": props.variant ?? "default",
						"data-inset": props.inset ? "" : undefined,
						class: cn(row, "relative", classes, attrs.class as string),
						onSelect: (event: Event) => {
							props.onSelect?.(event);
							if (props.closeOnSelect === false) event.preventDefault();
						},
					},
					slots
				);
		},
		{
			name: slot,
			inheritAttrs: false,
			props: {
				inset: Boolean,
				variant: String as PropType<"default" | "destructive">,
				closeOnSelect: { type: Boolean, default: undefined },
				onSelect: selectListener,
			},
		}
	);
}

export function menuSubTrigger<T extends NativePart>(part: T, slot: string, classes: string) {
	return defineComponent(
		(props: NativeProps<T> & { inset?: boolean }, { attrs, slots }) => {
			const { forwardRef } = useForwardExpose();
			return () =>
				h(
					part,
					{
						...attrs,
						ref: forwardRef,
						"data-slot": slot,
						"data-inset": enabled(props.inset) ? "" : undefined,
						class: cn(row, classes, attrs.class as string),
					},
					usesChild(attrs)
						? slots
						: {
								default: () => [
									slots.default?.(),
									h(ChevronRightIcon, {
										class: "ms-auto size-4 rtl:rotate-180",
										"aria-hidden": "true",
									}),
								],
							}
				);
		},
		{ name: slot, inheritAttrs: false, props: ["inset"] }
	);
}

export const checkboxGroupKey: InjectionKey<{
	values: Ref<string[]>;
	set: (value: string, checked: boolean) => void;
}> = Symbol("DropdownMenuCheckboxGroup");

type SelectProps = { closeOnSelect?: boolean; inset?: boolean; onSelect?: SelectListener };
type CheckedState = boolean | "indeterminate";

function indicator(part: NativePart, slot: string, classes: string, state?: CheckedState) {
	return h(
		part,
		{ "data-slot": slot, class: classes, "aria-hidden": "true" },
		{
			default: () => (state === "indeterminate" ? h(MinusIcon) : h(CheckIcon)),
		}
	);
}

export function menuCheckbox(
	part: NativePart,
	marker: NativePart,
	slot: string,
	styles: string,
	indicatorStyles: string
) {
	return defineComponent(
		(
			props: DropdownMenuCheckboxItemProps &
				SelectProps & {
					defaultValue?: CheckedState;
					value?: string;
					"onUpdate:modelValue"?: (value: boolean) => void;
				},
			{ attrs, slots, emit }
		) => {
			const { forwardRef } = useForwardExpose();
			const group = inject(checkboxGroupKey, null);
			const local = ref<CheckedState>(props.defaultValue ?? false);
			const state = computed(
				() =>
					props.modelValue ??
					(group && props.value !== undefined
						? group.values.value.includes(props.value)
						: local.value)
			);
			return () =>
				h(
					part,
					{
						...attrs,
						ref: forwardRef,
						"data-slot": slot,
						"data-inset": props.inset ? "" : undefined,
						class: cn(row, "relative", styles, attrs.class as string),
						modelValue: state.value,
						"onUpdate:modelValue": (value: boolean) => {
							local.value = value;
							if (group && props.value !== undefined) group.set(props.value, value);
							emit("update:modelValue", value);
						},
						onSelect: (event: Event) => {
							props.onSelect?.(event);
							if (!props.closeOnSelect) event.preventDefault();
						},
					},
					usesChild(attrs)
						? slots
						: {
								default: () => [
									indicator(marker, `${slot}-indicator`, indicatorStyles, state.value),
									slots.default?.({ modelValue: state.value }),
								],
							}
				);
		},
		{
			name: slot,
			inheritAttrs: false,
			props: {
				modelValue: { type: [Boolean, String] as PropType<CheckedState>, default: undefined },
				defaultValue: [Boolean, String] as PropType<CheckedState>,
				value: String,
				inset: Boolean,
				closeOnSelect: Boolean,
				onSelect: selectListener,
			},
			emits: ["update:modelValue"],
		}
	);
}

export function menuRadio(
	part: NativePart,
	marker: NativePart,
	slot: string,
	styles: string,
	indicatorStyles: string
) {
	return defineComponent(
		(props: DropdownMenuRadioItemProps & SelectProps, { attrs, slots }) => {
			const { forwardRef } = useForwardExpose();
			return () =>
				h(
					part,
					{
						...attrs,
						ref: forwardRef,
						"data-slot": slot,
						value: props.value,
						"data-inset": props.inset ? "" : undefined,
						class: cn(row, "relative", styles, attrs.class as string),
						onSelect: (event: Event) => {
							props.onSelect?.(event);
							if (!props.closeOnSelect) event.preventDefault();
						},
					},
					usesChild(attrs)
						? slots
						: {
								default: () => [
									indicator(marker, `${slot}-indicator`, indicatorStyles),
									slots.default?.(),
								],
							}
				);
		},
		{
			name: slot,
			inheritAttrs: false,
			props: {
				value: { required: true },
				inset: Boolean,
				closeOnSelect: Boolean,
				onSelect: selectListener,
			},
		}
	);
}

const subKey: InjectionKey<() => void> = Symbol("MenuSub");

export function menuSub(part: NativePart, name: string) {
	return defineComponent(
		(
			props: { open?: boolean; "onUpdate:open"?: (open: boolean) => void },
			{ attrs, slots, emit }
		) => {
			const local = ref(false);
			function update(value: boolean) {
				local.value = value;
				emit("update:open", value);
			}
			provide(subKey, () => update(false));
			return () =>
				h(part, { ...attrs, open: props.open ?? local.value, "onUpdate:open": update }, slots);
		},
		{
			name,
			inheritAttrs: false,
			props: { open: { type: Boolean, default: undefined } },
			emits: ["update:open"],
		}
	);
}

const menuBounds =
	"z-50 max-h-(--reka-popper-available-height) max-w-[min(var(--reka-popper-available-width,100vw),calc(100vw-1rem))] origin-(--reka-popper-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden";

function useSubEscape(emit: (event: KeyboardEvent) => void) {
	const close = inject(subKey, null);
	return (event: KeyboardEvent) => {
		if (!close || event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
		const content = event.currentTarget as HTMLElement;
		if (
			!(event.target instanceof Element) ||
			event.target.closest("[data-dismissable-layer]") !== content
		)
			return;
		// Native Reka SubContent dismisses the entire root from its document listener.
		// Keep an Escape handled inside this subpanel local to its level.
		emit(event);
		event.stopPropagation();
		if (event.defaultPrevented) return;
		event.preventDefault();
		const id = content.getAttribute("aria-labelledby");
		const root = content.getRootNode() as Document | ShadowRoot;
		if (id)
			(root.getElementById(id) ?? content.ownerDocument.getElementById(id))?.focus({
				preventScroll: true,
			});
		close();
	};
}

export function menuContent<T extends NativePart, Extra extends object = object>(
	part: T,
	portal: NativePart,
	slot: string,
	classes: string,
	options: {
		sub?: boolean;
		defaults?: Record<string, unknown>;
		style?: (props: Extra) => { classes?: string; attrs?: Record<string, unknown> };
		setup?: () => Record<string, unknown>;
	} = {}
) {
	return defineComponent(
		(
			props: NativeProps<T> &
				Extra & {
					portalProps?: DropdownMenuPortalProps;
					class?: HTMLAttributes["class"];
				},
			{ attrs, slots }
		) => {
			const { forwardRef } = useForwardExpose();
			const setupAttrs = options.setup?.();
			const onKeydown = useSubEscape((event) => {
				const listener = attrs.onEscapeKeyDown;
				if (typeof listener === "function") listener(event);
			});
			return () => {
				const style = options.style?.(props);
				const { class: className, ...nativeAttrs } = attrs;
				return h(portal, props.portalProps, {
					default: () =>
						h(
							part,
							mergeProps(
								{ collisionPadding: 8, ...options.defaults },
								nativeAttrs,
								setupAttrs ?? {},
								style?.attrs ?? {},
								{
									ref: forwardRef,
									"data-slot": slot,
									class: cn(menuBounds, classes, style?.classes, className as string),
									onKeydown: options.sub ? onKeydown : undefined,
								}
							),
							slots
						),
				});
			};
		},
		{ name: slot, inheritAttrs: false, props: ["portalProps", "appearance", "elevated"] }
	);
}
