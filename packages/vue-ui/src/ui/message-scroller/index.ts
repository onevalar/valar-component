import { ArrowDownIcon } from "@lucide/vue";
import { cn } from "cn";
import {
	defineComponent,
	h,
	inject,
	onMounted,
	onScopeDispose,
	provide,
	shallowRef,
	watch,
	type InjectionKey,
	type PropType,
} from "vue";
import {
	MessageScrollerState,
	type MessageScrollerButtonDirection,
	type MessageScrollerDefaultScrollPosition,
} from "./state";
import { buttonVariants, type ButtonVariants } from "../button";

export type {
	MessageScrollerButtonDirection,
	MessageScrollerCommands,
	MessageScrollerDefaultScrollPosition,
	MessageScrollerScrollable,
	MessageScrollerScrollAlign,
	MessageScrollerScrollOptions,
	MessageScrollerVisibilityState,
} from "./state";

const key: InjectionKey<{ state: MessageScrollerState; pending: boolean }> =
	Symbol("MessageScroller");
function useScroller() {
	const context = inject(key);
	if (!context) throw new Error("MessageScroller parts require MessageScrollerProvider.");
	return context;
}

export const MessageScrollerProvider = defineComponent({
	name: "MessageScrollerProvider",
	props: {
		autoScroll: Boolean,
		defaultScrollPosition: String as PropType<MessageScrollerDefaultScrollPosition>,
		scrollEdgeThreshold: Number,
		scrollPreviousItemPeek: Number,
		scrollMargin: Number,
	},
	setup(props, { slots }) {
		const state = new MessageScrollerState({ ...props });
		provide(key, { state, pending: props.defaultScrollPosition !== "start" });
		watch(
			() => ({ ...props }),
			(options) => state.setOptions(options)
		);
		onMounted(state.connect);
		onScopeDispose(state.disconnect);
		return () => slots.default?.();
	},
});

export function useMessageScroller() {
	return useScroller().state.commands;
}
export function useMessageScrollerScrollable() {
	const { state } = useScroller();
	const edges = shallowRef(state.getSnapshot());
	onMounted(() => {
		edges.value = state.getSnapshot();
	});
	onScopeDispose(
		state.subscribe(() => {
			edges.value = state.getSnapshot();
		})
	);
	return edges;
}
export function useMessageScrollerVisibility() {
	const { state } = useScroller();
	const visibility = shallowRef(state.getVisibility());
	onMounted(() => {
		visibility.value = state.getVisibility();
	});
	onScopeDispose(
		state.subscribeVisibility(() => {
			visibility.value = state.getVisibility();
		})
	);
	return visibility;
}

function bindPart(state: MessageScrollerState, name: "root" | "viewport" | "content" | "spacer") {
	return (node: unknown) => {
		state[name] = node as HTMLElement | null;
		if (node) state.schedule();
		state.connect();
	};
}

export const MessageScrollerRoot = defineComponent({
	name: "MessageScrollerRoot",
	inheritAttrs: false,
	setup(_, { attrs, slots, expose }) {
		const { state, pending } = useScroller();
		expose({
			get element() {
				return state.root;
			},
		});
		const ref = bindPart(state, "root");
		return () =>
			h(
				"div",
				{
					...attrs,
					ref,
					"data-slot": "message-scroller",
					"data-pending-scroll": pending ? "" : undefined,
					class: cn(
						"group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
						attrs.class
					),
				},
				slots.default?.()
			);
	},
});

export const MessageScrollerViewport = defineComponent({
	name: "MessageScrollerViewport",
	inheritAttrs: false,
	props: { preserveScrollOnPrepend: { type: Boolean, default: true } },
	setup(props, { attrs, slots, expose }) {
		const { state, pending } = useScroller();
		watch(
			() => props.preserveScrollOnPrepend,
			(preserve) => {
				state.preserveScrollOnPrepend = preserve;
			},
			{ immediate: true }
		);
		expose({
			get element() {
				return state.viewport;
			},
		});
		const ref = bindPart(state, "viewport");
		return () =>
			h(
				"div",
				{
					role: "region",
					"aria-label": "消息",
					tabindex: 0,
					...attrs,
					ref,
					"data-slot": "message-scroller-viewport",
					"data-pending-scroll": pending ? "" : undefined,
					class: cn(
						"size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible",
						attrs.class
					),
				},
				slots.default?.()
			);
	},
});

export const MessageScrollerContent = defineComponent({
	name: "MessageScrollerContent",
	inheritAttrs: false,
	props: { spacerClassName: String },
	setup(props, { attrs, slots, expose }) {
		const { state } = useScroller();
		expose({
			get element() {
				return state.content;
			},
		});
		const ref = bindPart(state, "content");
		const spacer = bindPart(state, "spacer");
		return () =>
			h(
				"div",
				{
					role: "log",
					"aria-relevant": "additions",
					...attrs,
					ref,
					"data-slot": "message-scroller-content",
					class: cn("cn-message-scroller-content flex h-max min-h-full flex-col", attrs.class),
				},
				[
					slots.default?.(),
					h("div", {
						ref: spacer,
						"aria-hidden": "true",
						"data-message-scroller-spacer": "",
						hidden: true,
						class: cn("pointer-events-none shrink-0", props.spacerClassName),
					}),
				]
			);
	},
});

export const MessageScrollerItem = defineComponent({
	name: "MessageScrollerItem",
	inheritAttrs: false,
	props: { messageId: String, scrollAnchor: Boolean },
	setup(props, { attrs, slots }) {
		return () =>
			h(
				"div",
				{
					...attrs,
					"data-slot": "message-scroller-item",
					"data-message-id": props.messageId,
					"data-scroll-anchor": String(props.scrollAnchor),
					class: cn(
						"min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
						attrs.class
					),
				},
				slots.default?.()
			);
	},
});

export const MessageScrollerButton = defineComponent({
	name: "MessageScrollerButton",
	inheritAttrs: false,
	props: {
		direction: { type: String as PropType<MessageScrollerButtonDirection>, default: "end" },
		behavior: { type: String as PropType<ScrollBehavior>, default: "smooth" },
		variant: { type: String as PropType<ButtonVariants["variant"]>, default: "secondary" },
		size: { type: String as PropType<ButtonVariants["size"]>, default: "icon-sm" },
		label: String,
	},
	emits: { click: (_event: MouseEvent) => true },
	setup(props, { attrs, emit, slots }) {
		const edges = useMessageScrollerScrollable();
		const commands = useMessageScroller();
		return () => {
			const direction = props.direction;
			const active = edges.value[direction];
			return h(
				"button",
				{
					type: "button",
					...attrs,
					"data-slot": "message-scroller-button",
					"data-direction": direction,
					"data-active": String(active),
					"data-variant": props.variant,
					"data-size": props.size,
					inert: !active,
					tabindex: active ? attrs.tabindex : -1,
					class: cn(
						buttonVariants({ variant: props.variant, size: props.size }),
						"absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full motion-reduce:transition-none rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
						attrs.class
					),
					onClick: (event: MouseEvent) => {
						if (!active) return;
						emit("click", event);
						if (event.defaultPrevented) return;
						(event.currentTarget as HTMLButtonElement).blur();
						(direction === "end" ? commands.scrollToEnd : commands.scrollToStart)({
							behavior: props.behavior,
						});
					},
				},
				slots.default?.({ active, direction }) ?? [
					h(ArrowDownIcon, { "aria-hidden": "true" }),
					h(
						"span",
						{ class: "sr-only" },
						props.label ?? (direction === "end" ? "滚动到底部" : "滚动到顶部")
					),
				]
			);
		};
	},
});

export const MessageScroller = MessageScrollerRoot;
export {
	MessageScrollerProvider as Provider,
	MessageScrollerRoot as Root,
	MessageScrollerViewport as Viewport,
	MessageScrollerContent as Content,
	MessageScrollerItem as Item,
	MessageScrollerButton as Button,
};
