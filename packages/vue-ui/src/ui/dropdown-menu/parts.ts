import { CheckIcon, ChevronRightIcon, MinusIcon } from "@lucide/vue";
import {
	Menu as SdkMenu,
	MenuCheckboxItem as SdkCheckboxItem,
	MenuContent as SdkContent,
	MenuGroup as SdkGroup,
	MenuGroupLabel as SdkGroupLabel,
	MenuItem as SdkItem,
	MenuRadioGroup as SdkRadioGroup,
	MenuRadioItem as SdkRadioItem,
	MenuSeparator as SdkSeparator,
	MenuSub as SdkSub,
	MenuSubContent as SdkSubContent,
	MenuSubTrigger as SdkSubTrigger,
	MenuTrigger as SdkTrigger,
	type MenuCheckedChangeReason,
	type MenuFinalFocus,
	type MenuOpenChangeReason,
	type MenuValueChangeReason,
} from "@ui-sdk/vue/menu";
import type { Anchor, ChangeDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import {
	computed,
	defineComponent,
	getCurrentInstance,
	h,
	inject,
	onBeforeUnmount,
	provide,
	ref,
	useId,
	watchEffect,
} from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import { Kbd } from "../kbd/index.js";
import { resolvePortalContainer } from "../tooltip/context";
import type { Component, HTMLAttributes, InjectionKey, PropType, Ref } from "vue";

type NativePart = Component & (new () => { $props: object });
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

export type MenuDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

export const menuPolicyKey: InjectionKey<Ref<MenuDismissPolicy>> = Symbol("ValarMenuPolicy");
export const menuSubPolicyKey: InjectionKey<Ref<MenuDismissPolicy>> = Symbol("ValarMenuSubPolicy");
export const inMenuGroupKey: InjectionKey<boolean> = Symbol("ValarInMenuGroup");

export interface MenuPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

export function menuPortal(name: string) {
	return defineComponent({
		name,
		props: {
			to: [String, Object] as PropType<string | Element | DocumentFragment | null>,
			disabled: Boolean,
			forceMount: Boolean,
		},
		setup(_, { slots }) {
			return () => slots.default?.();
		},
	});
}

export function menuRoot(name: string) {
	return defineComponent({
		name,
		inheritAttrs: false,
		props: {
			open: { type: Boolean, default: undefined },
			modelValue: { type: Boolean, default: undefined },
			defaultOpen: { type: Boolean, default: undefined },
			modal: { type: [Boolean, String] as PropType<boolean | "pointer">, default: undefined },
			loop: { type: Boolean, default: undefined },
			delay: Number,
			presentation: {
				type: String as PropType<"auto" | "popover" | "sheet">,
				default: "popover",
			},
			dismissible: { type: Boolean, default: undefined },
			container: Object as PropType<Element | DocumentFragment | null>,
			dir: String as PropType<"ltr" | "rtl">,
		},
		emits: ["update:open", "update:modelValue", "openChange", "openChangeComplete"],
		setup(props, { attrs, slots, emit }) {
			const policy = ref<MenuDismissPolicy>({});
			provide(menuPolicyKey, policy);

			function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
				if (!next) {
					if (details.reason === "outside-press" && policy.value.onInteractOutside) {
						const event = new CustomEvent("interactOutside", {
							cancelable: true,
							detail: { originalEvent: details.event },
						});
						policy.value.onInteractOutside(event);
						if (event.defaultPrevented) {
							details.cancel();
							return;
						}
					}
					if (details.reason === "escape-key" && policy.value.onEscapeKeyDown) {
						const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
						policy.value.onEscapeKeyDown(event);
						if (event.defaultPrevented) {
							details.cancel();
							return;
						}
					}
				}
				emit("openChange", next, details);
				if (!details.canceled) {
					if (!next && details.reason === "escape-key") {
						details.event?.stopPropagation();
					}
					emit("update:open", next);
					emit("update:modelValue", next);
				}
			}

			return () =>
				h(
					SdkMenu,
					{
						...attrs,
						open: props.open ?? props.modelValue,
						defaultOpen: props.defaultOpen,
						modal: props.modal,
						loop: props.loop,
						delay: props.delay,
						presentation: props.presentation,
						dismissible: props.dismissible,
						container: props.container,
						onOpenChange: handleOpenChange,
						onOpenChangeComplete: (next: boolean) => emit("openChangeComplete", next),
					},
					slots
				);
		},
	});
}

export function menuTrigger(slot: string, classes?: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "button" },
			asChild: Boolean,
			disabled: { type: Boolean, default: undefined },
			focusableWhenDisabled: { type: Boolean, default: undefined },
			payload: null,
			shortcut: String,
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		setup(props, { attrs, slots }) {
			return () =>
				h(
					SdkTrigger,
					{
						...attrs,
						disabled: props.disabled,
						focusableWhenDisabled: props.focusableWhenDisabled,
						payload: props.payload,
						shortcut: props.shortcut,
						class: cn(classes, props.class),
					},
					{
						render: ({
							props: part,
							state,
						}: {
							props: Record<string, unknown>;
							state: { open: boolean };
						}) =>
							h(
								DisclosureElement,
								{
									as: props.as,
									asChild: props.asChild,
									part: {
										...part,
										"data-slot": slot,
										"data-state": state.open ? "open" : "closed",
									},
								},
								slots
							),
					}
				);
		},
	});
}

export function menuGroup(slot: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		setup(_, { attrs, slots }) {
			provide(inMenuGroupKey, true);
			return () =>
				h(
					SdkGroup,
					{ ...attrs },
					{
						render: ({ props: part }: { props: Record<string, unknown> }) =>
							h("div", { ...part, "data-slot": slot }, slots.default?.()),
					}
				);
		},
	});
}

export function menuRadioGroup(slot: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			name: String,
			value: { type: String as PropType<string | null>, default: undefined },
			modelValue: { type: String as PropType<string | null>, default: undefined },
			defaultValue: { type: String as PropType<string | null>, default: undefined },
		},
		emits: ["update:modelValue", "update:value", "valueChange"],
		setup(props, { attrs, slots, emit }) {
			const generatedName = useId();
			const local = ref<string | null>(props.defaultValue ?? "");
			const current = computed(() => props.modelValue ?? props.value ?? local.value);
			provide(inMenuGroupKey, true);

			return () =>
				h(
					SdkRadioGroup,
					{
						...attrs,
						name: props.name ?? generatedName,
						value: current.value,
						onValueChange: (next: string, details: ChangeDetails<MenuValueChangeReason>) => {
							emit("valueChange", next, details);
							if (!details.canceled) {
								local.value = next;
								emit("update:modelValue", next);
								emit("update:value", next);
							}
						},
					},
					{
						render: ({ props: part }: { props: Record<string, unknown> }) =>
							h("div", { ...part, "data-slot": slot }, slots.default?.()),
					}
				);
		},
	});
}

export function menuLabel(slot: string, classes: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			inset: Boolean,
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		setup(props, { attrs, slots }) {
			const inGroup = inject(inMenuGroupKey, false);
			return () => {
				if (inGroup) {
					return h(
						SdkGroupLabel,
						{
							...attrs,
							class: cn(classes, props.class, attrs.class as string),
						},
						{
							render: ({ props: part }: { props: Record<string, unknown> }) =>
								h(
									"div",
									{
										...part,
										"data-slot": slot,
										"data-inset": enabled(props.inset) ? "" : undefined,
									},
									slots.default?.()
								),
						}
					);
				}
				return h(
					"div",
					{
						...attrs,
						"data-slot": slot,
						"data-inset": enabled(props.inset) ? "" : undefined,
						class: cn(classes, props.class, attrs.class as string),
					},
					slots.default?.()
				);
			};
		},
	});
}

export function menuSeparator(slot: string, classes: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		setup(props, { attrs }) {
			return () =>
				h(
					SdkSeparator,
					{
						...attrs,
						class: cn(classes, props.class, attrs.class as string),
					},
					{
						render: ({ props: part }: { props: Record<string, unknown> }) =>
							h("div", { ...part, "data-slot": slot }),
					}
				);
		},
	});
}

export function menuShortcut(slot: string, classes: string) {
	return styledPart(Kbd, slot, classes, { appearance: "inline" });
}

const row =
	"flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export function menuItem(slot: string, classes: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			inset: Boolean,
			variant: { type: String as PropType<"default" | "destructive">, default: "default" },
			value: String,
			label: String,
			textValue: String,
			disabled: { type: Boolean, default: undefined },
			shortcut: String,
			closeOnSelect: { type: Boolean, default: true },
			onSelect: selectListener,
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		setup(props, { attrs, slots }) {
			return () =>
				h(
					SdkItem,
					{
						...attrs,
						value: props.value,
						label: props.label ?? props.textValue,
						disabled: props.disabled,
						destructive: props.variant === "destructive",
						shortcut: props.shortcut,
						closeOnSelect: props.closeOnSelect,
						onSelect: props.onSelect,
						class: cn(row, "relative", classes, props.class, attrs.class as string),
					},
					{
						render: ({ props: part }: { props: Record<string, unknown> }) =>
							h(
								DisclosureElement,
								{
									as: props.as,
									asChild: props.asChild || usesChild(attrs),
									part: {
										...part,
										"data-slot": slot,
										"data-variant": props.variant,
										"data-inset": props.inset ? "" : undefined,
									},
								},
								slots
							),
					}
				);
		},
	});
}

export function menuSubTrigger(slot: string, classes: string) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			inset: Boolean,
			disabled: { type: Boolean, default: undefined },
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		setup(props, { attrs, slots }) {
			return () =>
				h(
					SdkSubTrigger,
					{
						...attrs,
						disabled: props.disabled,
						class: cn(row, classes, props.class, attrs.class as string),
					},
					{
						render: ({
							props: part,
							state,
						}: {
							props: Record<string, unknown>;
							state: { open: boolean };
						}) => {
							const childMode = props.asChild || usesChild(attrs);
							return h(
								DisclosureElement,
								{
									as: props.as,
									asChild: childMode,
									part: {
										...part,
										"data-slot": slot,
										"data-inset": enabled(props.inset) ? "" : undefined,
										"data-state": state.open ? "open" : "closed",
									},
								},
								childMode
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
					}
				);
		},
	});
}

export const checkboxGroupKey: InjectionKey<{
	values: Ref<string[]>;
	set: (value: string, checked: boolean) => void;
}> = Symbol("DropdownMenuCheckboxGroup");

type CheckedState = boolean | "indeterminate";

export function menuCheckbox(
	slot: string,
	styles: string,
	indicatorSlot: string,
	indicatorStyles: string
) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			modelValue: { type: [Boolean, String] as PropType<CheckedState>, default: undefined },
			checked: { type: [Boolean, String] as PropType<CheckedState>, default: undefined },
			defaultValue: [Boolean, String] as PropType<CheckedState>,
			defaultChecked: [Boolean, String] as PropType<CheckedState>,
			value: String,
			label: String,
			textValue: String,
			disabled: { type: Boolean, default: undefined },
			inset: Boolean,
			closeOnSelect: { type: Boolean, default: false },
			onSelect: selectListener,
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		emits: ["update:modelValue", "update:checked", "checkedChange"],
		setup(props, { attrs, slots, emit }) {
			const generatedId = useId();
			const group = inject(checkboxGroupKey, null);
			const local = ref<CheckedState>(props.defaultValue ?? props.defaultChecked ?? false);
			const current = computed<CheckedState>(
				() =>
					props.modelValue ??
					props.checked ??
					(group && props.value !== undefined
						? group.values.value.includes(props.value)
						: local.value)
			);

			return () => {
				const isIndeterminate = current.value === "indeterminate";
				return h(
					SdkCheckboxItem,
					{
						...attrs,
						value: props.value ?? generatedId,
						label: props.label ?? props.textValue,
						disabled: props.disabled,
						checked: isIndeterminate ? false : Boolean(current.value),
						closeOnSelect: props.closeOnSelect,
						class: cn(row, "relative", styles, props.class, attrs.class as string),
						onCheckedChange: (next: boolean, details: ChangeDetails<MenuCheckedChangeReason>) => {
							if (props.onSelect) {
								props.onSelect(new Event("select", { cancelable: true }));
							}
							emit("checkedChange", next, details);
							if (!details.canceled) {
								local.value = next;
								if (group && props.value !== undefined) group.set(props.value, next);
								emit("update:modelValue", next);
								emit("update:checked", next);
							}
						},
					},
					{
						render: ({
							props: part,
							state,
						}: {
							props: Record<string, unknown>;
							state: { checked: boolean };
						}) => {
							const childMode = props.asChild || usesChild(attrs);
							const indicatorState = isIndeterminate
								? "indeterminate"
								: state.checked
									? "checked"
									: "unchecked";
							const mergedPart: Record<string, unknown> = {
								...part,
								"data-slot": slot,
								"data-inset": props.inset ? "" : undefined,
								"data-state": indicatorState,
								...(isIndeterminate
									? {
											"aria-checked": "mixed",
											"data-indeterminate": "",
											"data-checked": undefined,
											"data-unchecked": undefined,
										}
									: {}),
							};
							return h(
								DisclosureElement,
								{
									as: props.as,
									asChild: childMode,
									part: mergedPart,
								},
								childMode
									? slots
									: {
											default: () => [
												isIndeterminate || state.checked
													? h(
															"span",
															{
																"data-slot": indicatorSlot,
																"data-state": indicatorState,
																class: indicatorStyles,
																"aria-hidden": "true",
															},
															[isIndeterminate ? h(MinusIcon) : h(CheckIcon)]
														)
													: null,
												slots.default?.({ modelValue: current.value }),
											],
										}
							);
						},
					}
				);
			};
		},
	});
}

export function menuRadio(
	slot: string,
	styles: string,
	indicatorSlot: string,
	indicatorStyles: string
) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			value: { type: String, required: true },
			label: String,
			textValue: String,
			disabled: { type: Boolean, default: undefined },
			inset: Boolean,
			closeOnSelect: { type: Boolean, default: false },
			onSelect: selectListener,
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		setup(props, { attrs, slots }) {
			return () =>
				h(
					SdkRadioItem,
					{
						...attrs,
						value: props.value,
						label: props.label ?? props.textValue,
						disabled: props.disabled,
						closeOnSelect: props.closeOnSelect,
						class: cn(row, "relative", styles, props.class, attrs.class as string),
						onClick: (event: MouseEvent) => {
							const origClick = attrs.onClick as ((e: MouseEvent) => void) | undefined;
							origClick?.(event);
							if (props.onSelect && !props.disabled) {
								props.onSelect(new Event("select", { cancelable: true }));
							}
						},
					},
					{
						render: ({
							props: part,
							state,
						}: {
							props: Record<string, unknown>;
							state: { checked: boolean };
						}) => {
							const childMode = props.asChild || usesChild(attrs);
							return h(
								DisclosureElement,
								{
									as: props.as,
									asChild: childMode,
									part: {
										...part,
										"data-slot": slot,
										"data-inset": props.inset ? "" : undefined,
										"data-state": state.checked ? "checked" : "unchecked",
									},
								},
								childMode
									? slots
									: {
											default: () => [
												state.checked
													? h(
															"span",
															{
																"data-slot": indicatorSlot,
																"data-state": "checked",
																class: indicatorStyles,
																"aria-hidden": "true",
															},
															[h(CheckIcon)]
														)
													: null,
												slots.default?.(),
											],
										}
							);
						},
					}
				);
		},
	});
}

export function menuSub(name: string) {
	return defineComponent({
		name,
		inheritAttrs: false,
		props: {
			open: { type: Boolean, default: undefined },
			defaultOpen: { type: Boolean, default: undefined },
			loop: { type: Boolean, default: undefined },
			delay: Number,
		},
		emits: ["update:open", "openChange", "openChangeComplete"],
		setup(props, { attrs, slots, emit }) {
			const policy = ref<MenuDismissPolicy>({});
			provide(menuSubPolicyKey, policy);

			function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
				if (!next && details.reason === "escape-key" && policy.value.onEscapeKeyDown) {
					const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
					policy.value.onEscapeKeyDown(event);
					if (event.defaultPrevented) {
						details.cancel();
						return;
					}
				}
				emit("openChange", next, details);
				if (!details.canceled) {
					if (!next && details.reason === "escape-key") {
						details.event?.stopPropagation();
					}
					emit("update:open", next);
				}
			}

			return () =>
				h(
					SdkSub,
					{
						...attrs,
						open: props.open,
						defaultOpen: props.defaultOpen,
						loop: props.loop,
						delay: props.delay,
						onOpenChange: handleOpenChange,
						onOpenChangeComplete: (next: boolean) => emit("openChangeComplete", next),
					},
					slots
				);
		},
	});
}

const menuBounds =
	"z-50 max-h-(--available-height) max-w-[min(var(--available-width,100vw),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden [--bits-floating-available-width:var(--available-width)]";

function skipDisabledMenuItems(menuEl: HTMLElement | null, key: string) {
	if (!menuEl) return;
	const step =
		key === "ArrowDown" || key === "Home" || key === "PageUp"
			? 1
			: key === "ArrowUp" || key === "End" || key === "PageDown"
				? -1
				: 0;
	if (!step) return;
	queueMicrotask(() => {
		const active = document.activeElement as HTMLElement | null;
		if (!active || !menuEl.contains(active) || active.getAttribute("aria-disabled") !== "true") {
			return;
		}
		const items = [
			...menuEl.querySelectorAll<HTMLElement>(
				'[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'
			),
		].filter((item) => item.closest('[role="menu"]') === menuEl);
		const start = items.indexOf(active);
		if (start === -1 || items.length < 2) return;
		for (let offset = 1; offset < items.length; offset++) {
			const candidate = items[(start + offset * step + items.length) % items.length];
			if (candidate.getAttribute("aria-disabled") !== "true") {
				candidate.focus({ preventScroll: true });
				return;
			}
		}
	});
}

export function menuContent<Extra extends object = object>(
	slot: string,
	classes: string,
	options: {
		sub?: boolean;
		defaults?: {
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
		};
		style?: (props: Extra) => { classes?: string; attrs?: Record<string, unknown> };
	} = {}
) {
	return defineComponent({
		name: slot,
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			side: { type: String as PropType<Side>, default: options.defaults?.side },
			align: {
				type: String as PropType<"start" | "center" | "end">,
				default: options.defaults?.align ?? "start",
			},
			sideOffset: { type: Number, default: options.defaults?.sideOffset },
			alignOffset: { type: Number, default: options.defaults?.alignOffset },
			collisionPadding: { type: Number, default: options.defaults?.collisionPadding ?? 8 },
			arrowPadding: Number,
			anchor: [String, Object] as PropType<Anchor | string | null>,
			finalFocus: [String, Object, Function] as PropType<MenuFinalFocus>,
			keepMounted: { type: Boolean, default: undefined },
			forceMount: { type: Boolean, default: undefined },
			container: Object as PropType<Element | DocumentFragment | null>,
			portalProps: Object as PropType<MenuPortalProps>,
			appearance: String as PropType<"default" | "surface">,
			elevated: { type: Boolean, default: undefined },
			avoidCollisions: { type: Boolean, default: undefined },
			class: null as unknown as PropType<HTMLAttributes["class"]>,
		},
		emits: ["interactOutside", "escapeKeyDown", "closeAutoFocus"],
		setup(props, { attrs, slots, emit }) {
			const policy = inject(options.sub ? menuSubPolicyKey : menuPolicyKey, null);
			const instance = getCurrentInstance();

			watchEffect(() => {
				if (!policy) return;
				const vnodeProps = instance?.vnode.props ?? {};
				policy.value = {
					onInteractOutside: vnodeProps.onInteractOutside
						? (event) => emit("interactOutside", event)
						: undefined,
					onEscapeKeyDown: vnodeProps.onEscapeKeyDown
						? (event) => emit("escapeKeyDown", event)
						: undefined,
				};
			});

			onBeforeUnmount(() => {
				if (policy) policy.value = {};
			});

			const resolvedFinalFocus = computed<MenuFinalFocus | undefined>(() => {
				if (props.finalFocus !== undefined) return props.finalFocus;
				if (!instance?.vnode.props?.onCloseAutoFocus) return undefined;
				return () => {
					const event = new Event("closeAutoFocus", { cancelable: true });
					emit("closeAutoFocus", event);
					if (event.defaultPrevented) {
						return document.activeElement instanceof HTMLElement ? document.activeElement : null;
					}
					return undefined;
				};
			});

			const SdkComp = options.sub ? SdkSubContent : SdkContent;

			return () => {
				const extraStyle = options.style?.(props as unknown as Extra);
				const resolvedContainer = props.portalProps?.disabled
					? undefined
					: (props.container ?? resolvePortalContainer(props.portalProps?.to));
				const resolvedKeepMounted =
					props.keepMounted ?? props.forceMount ?? props.portalProps?.forceMount;
				const hasExplicitAriaLabel = Boolean(attrs["aria-label"]) && !attrs["aria-labelledby"];

				return h(
					SdkComp,
					{
						...attrs,
						side: props.side,
						align: props.align,
						sideOffset: props.sideOffset,
						alignOffset: props.alignOffset,
						collisionPadding: props.collisionPadding,
						arrowPadding: props.arrowPadding,
						anchor: props.anchor,
						finalFocus: resolvedFinalFocus.value,
						keepMounted: resolvedKeepMounted,
						container: resolvedContainer,
						onKeydown: (event: KeyboardEvent) => {
							const orig = attrs.onKeydown as ((e: KeyboardEvent) => void) | undefined;
							orig?.(event);
							skipDisabledMenuItems(event.currentTarget as HTMLElement | null, event.key);
						},
						class: cn(menuBounds, classes, extraStyle?.classes, props.class, attrs.class as string),
						style: {
							"--reka-popper-available-height": "var(--available-height)",
							"--reka-popper-available-width": "var(--available-width)",
							"--reka-popper-transform-origin": "var(--transform-origin)",
							"--reka-dropdown-menu-trigger-width": "var(--anchor-width)",
							...(typeof attrs.style === "object" && attrs.style ? attrs.style : {}),
						},
					},
					{
						render: ({
							props: part,
							state,
						}: {
							props: Record<string, unknown>;
							state: { open: boolean };
						}) =>
							h(
								DisclosureElement,
								{
									as: props.as,
									asChild: props.asChild || usesChild(attrs),
									part: {
										...part,
										...(extraStyle?.attrs ?? {}),
										...(attrs["aria-labelledby"]
											? { "aria-labelledby": attrs["aria-labelledby"] }
											: hasExplicitAriaLabel
												? { "aria-labelledby": undefined }
												: {}),
										"data-slot": slot,
										"data-side":
											(part["data-side"] as string | undefined) ??
											props.side ??
											(options.sub ? "right" : "bottom"),
										"data-align": (part["data-align"] as string | undefined) ?? props.align,
										"data-state": state.open ? "open" : "closed",
									},
								},
								slots
							),
					}
				);
			};
		},
	});
}
