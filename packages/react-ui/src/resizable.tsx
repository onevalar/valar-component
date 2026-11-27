"use client";

import * as React from "react";
import { cn } from "cn";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export type {
	ImperativePanelGroupHandle as ResizablePaneGroupAPI,
	ImperativePanelHandle as ResizablePaneAPI,
	PanelGroupStorage as ResizablePaneGroupStorage,
} from "react-resizable-panels";

export type ResizablePaneGroupProps = Omit<React.ComponentProps<typeof PanelGroup>, "onLayout"> & {
	onLayoutChange?: React.ComponentProps<typeof PanelGroup>["onLayout"];
};

const ResizableDirection = React.createContext<ResizablePaneGroupProps["direction"]>("horizontal");

export function ResizablePaneGroup({
	className,
	direction,
	onLayoutChange,
	...props
}: ResizablePaneGroupProps) {
	return (
		<ResizableDirection.Provider value={direction}>
			<PanelGroup
				data-slot="resizable-pane-group"
				data-direction={direction}
				direction={direction}
				onLayout={onLayoutChange}
				className={cn(
					"cn-resizable-panel-group flex h-full min-h-0 w-full min-w-0 data-[direction=vertical]:flex-col",
					className
				)}
				{...props}
			/>
		</ResizableDirection.Provider>
	);
}

export type ResizablePaneProps = React.ComponentProps<typeof Panel>;

export function ResizablePane(props: ResizablePaneProps) {
	return <Panel data-slot="resizable-pane" {...props} />;
}

export type ResizableHandleProps = Omit<
	React.ComponentProps<typeof PanelResizeHandle>,
	"children" | "onDragging"
> & {
	appearance?: "default" | "workspace";
	withHandle?: boolean;
	onDraggingChange?: React.ComponentProps<typeof PanelResizeHandle>["onDragging"];
};

export function ResizableHandle({
	appearance = "default",
	className,
	disabled = false,
	hitAreaMargins = appearance === "workspace" ? { fine: 3, coarse: 3 } : undefined,
	onDraggingChange,
	onKeyDownCapture,
	tabIndex = 0,
	withHandle = false,
	...props
}: ResizableHandleProps) {
	const direction = React.useContext(ResizableDirection);
	return (
		<PanelResizeHandle
			data-slot="resizable-handle"
			data-appearance={appearance}
			data-direction={direction}
			data-enabled={!disabled}
			aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
			aria-disabled={disabled || undefined}
			disabled={disabled}
			tabIndex={disabled ? -1 : tabIndex}
			hitAreaMargins={hitAreaMargins}
			onDragging={onDraggingChange}
			onKeyDownCapture={(event) => {
				onKeyDownCapture?.(event);
				// v2 attaches Enter-to-collapse at group level, even on a disabled handle.
				if (disabled && event.key === "Enter") event.preventDefault();
			}}
			className={cn(
				"cn-resizable-handle relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-inset data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:translate-x-0 data-[direction=vertical]:after:-translate-y-1/2 [&[data-direction=vertical]>div]:rotate-90",
				appearance === "workspace" &&
					"cn-resizable-handle-workspace data-[resize-handle-active=pointer]:before:opacity-100 data-[resize-handle-active=pointer]:before:delay-0!",
				className
			)}
			{...props}
		>
			{withHandle && (
				<div aria-hidden="true" className="cn-resizable-handle-icon z-10 flex shrink-0" />
			)}
		</PanelResizeHandle>
	);
}
