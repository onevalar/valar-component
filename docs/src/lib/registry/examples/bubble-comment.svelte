<script lang="ts">
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let liked = $state(false);
</script>

<div class="grid w-full max-w-lg min-w-0 gap-2">
	<Bubble.Root variant="ghost">
		<Bubble.Content
			>{text("这条评论有一条赞同。", "One person agrees with this comment.")}</Bubble.Content
		>
	</Bubble.Root>
	<Bubble.Reactions
		appearance="comment"
		role="group"
		aria-label={text("评论回应", "Comment reactions")}
	>
		<Bubble.Reaction
			pressed={liked}
			aria-label={text("赞同", "Thumbs up")}
			onclick={() => (liked = !liked)}
		>
			<span aria-hidden="true" class="text-sm">👍</span>
			{liked ? 2 : 1}
		</Bubble.Reaction>
	</Bubble.Reactions>
</div>
