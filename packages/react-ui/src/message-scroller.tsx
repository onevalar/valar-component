"use client";

import * as React from "react";
import { cn } from "cn";
import { ArrowDown } from "lucide-react";
import { Button, type ButtonProps } from "./button.tsx";
import {
	EMPTY_EDGES,
	EMPTY_VISIBILITY,
	MessageScrollerState,
	type MessageScrollerButtonDirection,
	type MessageScrollerOptions,
} from "./message-scroller-state.ts";

export type {
	MessageScrollerButtonDirection,
	MessageScrollerCommands,
	MessageScrollerDefaultScrollPosition,
	MessageScrollerScrollable,
	MessageScrollerScrollAlign,
	MessageScrollerScrollOptions,
	MessageScrollerVisibilityState,
} from "./message-scroller-state.ts";

const Context = React.createContext<{ state: MessageScrollerState; pending: boolean } | null>(null);
function useScroller() {
	const context = React.useContext(Context);
	if (!context) throw new Error("MessageScroller parts require MessageScrollerProvider.");
	return context;
}
export type MessageScrollerProviderProps = MessageScrollerOptions & { children?: React.ReactNode };
export function MessageScrollerProvider({ children, ...options }: MessageScrollerProviderProps) {
	const [state] = React.useState(() => new MessageScrollerState(options));
	const [pending] = React.useState(() => options.defaultScrollPosition !== "start");
	React.useLayoutEffect(() => {
		state.setOptions(options);
	});
	React.useLayoutEffect(() => {
		state.connect();
		return state.disconnect;
	}, [state]);
	const context = React.useMemo(() => ({ state, pending }), [state, pending]);
	return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useMessageScroller() {
	return useScroller().state.commands;
}
export function useMessageScrollerScrollable() {
	const { state } = useScroller();
	return React.useSyncExternalStore(state.subscribe, state.getSnapshot, () => EMPTY_EDGES);
}
export function useMessageScrollerVisibility() {
	const { state } = useScroller();
	return React.useSyncExternalStore(
		state.subscribeVisibility,
		state.getVisibility,
		() => EMPTY_VISIBILITY
	);
}

type DivProps = React.ComponentProps<"div">;
function usePart(name: "root" | "viewport" | "content" | "spacer", ref?: DivProps["ref"]) {
	const { state } = useScroller();
	return React.useCallback(
		(node: HTMLDivElement | null) => {
			state[name] = node;
			if (node) state.schedule();
			state.connect();
			if (typeof ref === "function") {
				const clean = ref(node);
				if (typeof clean === "function")
					return () => {
						state[name] = null;
						state.connect();
						clean();
					};
			} else if (ref) ref.current = node;
		},
		[name, state, ref]
	);
}

export type MessageScrollerRootProps = DivProps;
export function MessageScrollerRoot({ className, ref, ...props }: MessageScrollerRootProps) {
	const { pending } = useScroller();
	return (
		<div
			{...props}
			ref={usePart("root", ref)}
			data-slot="message-scroller"
			data-pending-scroll={pending ? "" : undefined}
			className={cn(
				"group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
				className
			)}
		/>
	);
}
export type MessageScrollerViewportProps = DivProps & { preserveScrollOnPrepend?: boolean };
export function MessageScrollerViewport({
	className,
	ref,
	preserveScrollOnPrepend = true,
	role = "region",
	"aria-label": label = "消息",
	tabIndex = 0,
	...props
}: MessageScrollerViewportProps) {
	const { state, pending } = useScroller();
	React.useLayoutEffect(() => {
		state.preserveScrollOnPrepend = preserveScrollOnPrepend;
	}, [state, preserveScrollOnPrepend]);
	return (
		<div
			{...props}
			ref={usePart("viewport", ref)}
			role={role}
			aria-label={label}
			tabIndex={tabIndex}
			data-slot="message-scroller-viewport"
			data-pending-scroll={pending ? "" : undefined}
			className={cn(
				"size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible",
				className
			)}
		/>
	);
}
export type MessageScrollerContentProps = DivProps & { spacerClassName?: string };
export function MessageScrollerContent({
	className,
	ref,
	children,
	spacerClassName,
	role = "log",
	"aria-relevant": relevant = "additions",
	...props
}: MessageScrollerContentProps) {
	const content = usePart("content", ref);
	const spacer = usePart("spacer");
	return (
		<div
			{...props}
			ref={content}
			role={role}
			aria-relevant={relevant}
			data-slot="message-scroller-content"
			className={cn("cn-message-scroller-content flex h-max min-h-full flex-col", className)}
		>
			{children}
			<div
				ref={spacer}
				aria-hidden="true"
				data-message-scroller-spacer=""
				hidden
				className={cn("pointer-events-none shrink-0", spacerClassName)}
			/>
		</div>
	);
}
export type MessageScrollerItemProps = DivProps & { messageId?: string; scrollAnchor?: boolean };
export function MessageScrollerItem({
	messageId,
	scrollAnchor = false,
	className,
	...props
}: MessageScrollerItemProps) {
	return (
		<div
			{...props}
			data-slot="message-scroller-item"
			data-message-id={messageId}
			data-scroll-anchor={String(scrollAnchor)}
			className={cn(
				"min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
				className
			)}
		/>
	);
}

export type MessageScrollerButtonProps = React.ComponentProps<"button"> &
	Pick<ButtonProps, "variant" | "size"> & {
		direction?: MessageScrollerButtonDirection;
		behavior?: ScrollBehavior;
		label?: string;
	};
export function MessageScrollerButton({
	direction = "end",
	behavior = "smooth",
	label = direction === "end" ? "滚动到底部" : "滚动到顶部",
	variant = "secondary",
	size = "icon-sm",
	className,
	children,
	onClick,
	tabIndex,
	type = "button",
	...props
}: MessageScrollerButtonProps) {
	const active = useMessageScrollerScrollable()[direction];
	const commands = useMessageScroller();
	return (
		<Button
			{...props}
			type={type}
			variant={variant}
			size={size}
			inert={!active}
			tabIndex={active ? tabIndex : -1}
			data-slot="message-scroller-button"
			data-active={String(active)}
			data-direction={direction}
			className={cn(
				"absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full motion-reduce:transition-none rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
				className
			)}
			onClick={(event) => {
				if (!active) return;
				onClick?.(event);
				if (event.defaultPrevented) return;
				event.currentTarget.blur();
				(direction === "end" ? commands.scrollToEnd : commands.scrollToStart)({ behavior });
			}}
		>
			{children ?? (
				<>
					<ArrowDown aria-hidden="true" />
					<span className="sr-only">{label}</span>
				</>
			)}
		</Button>
	);
}

export const MessageScroller = Object.assign(MessageScrollerRoot, {
	Provider: MessageScrollerProvider,
	Root: MessageScrollerRoot,
	Viewport: MessageScrollerViewport,
	Content: MessageScrollerContent,
	Item: MessageScrollerItem,
	Button: MessageScrollerButton,
});
export {
	MessageScrollerProvider as Provider,
	MessageScrollerRoot as Root,
	MessageScrollerViewport as Viewport,
	MessageScrollerContent as Content,
	MessageScrollerItem as Item,
	MessageScrollerButton as Button,
};
