import Actions from "./bubble-actions.svelte";
import Content from "./bubble-content.svelte";
import Group from "./bubble-group.svelte";
import Reaction from "./bubble-reaction.svelte";
import Reactions, {
	bubbleReactionsVariants,
	type BubbleReactionsAlign,
	type BubbleReactionsSide,
} from "./bubble-reactions.svelte";
import Root, { bubbleVariants, type BubbleVariant } from "./bubble.svelte";

export {
	Root,
	Actions,
	Group,
	Content,
	Reaction,
	Reactions,
	bubbleVariants,
	bubbleReactionsVariants,
	type BubbleVariant,
	type BubbleReactionsSide,
	type BubbleReactionsAlign,
	//
	Root as Bubble,
	Actions as BubbleActions,
	Group as BubbleGroup,
	Content as BubbleContent,
	Reaction as BubbleReaction,
	Reactions as BubbleReactions,
};
