<script lang="ts">
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
</script>

<Bubble.Group
	appearance="agent"
	role="group"
	aria-label={text("连续提问", "Consecutive prompts")}
	class="w-full max-w-lg"
>
	<Bubble.Root appearance="agent-user">
		<Bubble.Content>{text("先看看窄屏。", "Check the narrow layout first.")}</Bubble.Content>
	</Bubble.Root>
	<Bubble.Root appearance="agent-user">
		<Bubble.Content
			>{text("也请试一下键盘。", "Please check keyboard interaction too.")}</Bubble.Content
		>
	</Bubble.Root>
</Bubble.Group>
