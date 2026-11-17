<script lang="ts">
	import Bold from "@lucide/svelte/icons/bold";
	import Inbox from "@lucide/svelte/icons/inbox";
	import { getLocale } from "$lib/i18n/index.js";
	import { Toggle } from "$lib/registry/ui/toggle/index.js";

	const chinese = $derived(getLocale() === "zh");
	let bold = $state(false);
	let unread = $state(false);
</script>

<div class="grid w-full max-w-sm gap-4">
	<div class="flex min-w-0 items-center gap-1.5">
		<Toggle appearance="formatting" bind:pressed={bold} aria-label={chinese ? "加粗" : "Bold"}>
			<Bold aria-hidden="true" />
		</Toggle>
		<p class="text-[13px]" class:font-semibold={bold}>
			{chinese ? "评论文字示例" : "Example comment text"}
		</p>
	</div>

	<div class="grid gap-1">
		<div class="flex items-center justify-between gap-2">
			<p class="text-[13px] font-medium">{chinese ? "收件箱" : "Inbox"}</p>
			<Toggle
				appearance="toolbar"
				bind:pressed={unread}
				aria-label={chinese ? "仅显示未读" : "Show unreads only"}
			>
				<Inbox aria-hidden="true" />
			</Toggle>
		</div>
		<ul class="space-y-1 text-[13px] text-muted-foreground">
			<li>{chinese ? "未读 · 有新评论" : "Unread · New comment"}</li>
			{#if !unread}
				<li>{chinese ? "已读 · 项目更新" : "Read · Project update"}</li>
			{/if}
		</ul>
	</div>
</div>
