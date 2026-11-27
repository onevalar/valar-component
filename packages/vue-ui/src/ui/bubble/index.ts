// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { cva, type VariantProps } from "class-variance-authority";

export { default as Bubble } from "./Bubble.vue";
export { default as BubbleGroup } from "./BubbleGroup.vue";
export { default as BubbleContent } from "./BubbleContent.vue";
export { default as BubbleReactions } from "./BubbleReactions.vue";

export const bubbleVariants = cva("cn-bubble group/bubble relative flex w-fit min-w-0 flex-col", {
	variants: {
		variant: {
			default: "cn-bubble-variant-default",
			secondary: "cn-bubble-variant-secondary",
			muted: "cn-bubble-variant-muted",
			tinted: "cn-bubble-variant-tinted",
			outline: "cn-bubble-variant-outline",
			ghost: "cn-bubble-variant-ghost",
			destructive: "cn-bubble-variant-destructive",
		},
	},
	defaultVariants: { variant: "default" },
});

export const bubbleReactionsVariants = cva(
	"cn-bubble-reactions absolute z-10 flex w-fit items-center justify-center",
	{
		variants: {
			side: { top: "cn-bubble-reactions-side-top", bottom: "cn-bubble-reactions-side-bottom" },
			align: { start: "start-3", end: "end-3" },
		},
		defaultVariants: { side: "bottom", align: "end" },
	}
);

export type BubbleVariant = NonNullable<VariantProps<typeof bubbleVariants>["variant"]>;
export type BubbleAlign = "start" | "end";
export type BubbleReactionsSide = NonNullable<VariantProps<typeof bubbleReactionsVariants>["side"]>;
export type BubbleReactionsAlign = NonNullable<
	VariantProps<typeof bubbleReactionsVariants>["align"]
>;
