import {
	Popover as Root,
	PopoverClose as Close,
	PopoverContent as Content,
	PopoverTrigger as Trigger,
} from "@ui-sdk/react/popover";
import type * as Legacy from "@valar/react-ui/popover";
import type { ComponentProps, ReactElement } from "react";

type RootProps = Pick<
	ComponentProps<typeof Legacy.Popover>,
	"open" | "defaultOpen" | "onOpenChange" | "children"
>;
type TriggerProps = Pick<ComponentProps<typeof Legacy.PopoverTrigger>, "asChild" | "children">;
type ContentProps = Pick<
	ComponentProps<typeof Legacy.PopoverContent>,
	"align" | "appearance" | "aria-labelledby" | "aria-describedby" | "children"
>;

// Only the existing example's API is bridged. In particular, this does not
// promise Radix's layer stack or its cancellable focus/dismiss hooks.
export const sdkPopoverPilot = {
	Popover({ onOpenChange, ...props }: RootProps) {
		return <Root {...props} onOpenChange={(open) => onOpenChange?.(open)} />;
	},
	PopoverTrigger({ asChild, children }: TriggerProps) {
		return asChild ? <Trigger render={children as ReactElement} /> : <Trigger>{children}</Trigger>;
	},
	PopoverClose({ asChild, children }: TriggerProps) {
		return asChild ? <Close render={children as ReactElement} /> : <Close>{children}</Close>;
	},
	PopoverContent({
		align = "center",
		appearance = "default",
		"aria-labelledby": labelledBy,
		"aria-describedby": describedBy,
		children,
	}: ContentProps) {
		return (
			<Content
				align={align}
				sideOffset={4}
				collisionPadding={8}
				initialFocus="auto"
				render={<div aria-labelledby={labelledBy} aria-describedby={describedBy} />}
				className={`z-50 flex max-h-[min(calc(100dvh-1rem),var(--available-height,100dvh))] max-w-[calc(100dvw-1rem)] flex-col overflow-y-auto overscroll-contain rounded-[12px] border-[0.5px] border-[lch(91.9%_0_282)] bg-white text-popover-foreground shadow-md outline-hidden dark:border-[lch(25.68%_1.93_272)] dark:bg-[lch(12.72%_0.85_272)] ${appearance === "options" ? "w-[330px] text-[13px]" : "w-72 gap-2.5 p-2.5 text-sm"}`}
			>
				{children}
			</Content>
		);
	},
};
