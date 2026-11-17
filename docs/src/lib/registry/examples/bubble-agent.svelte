<script lang="ts">
	import Copy from "@lucide/svelte/icons/copy";
	import Pencil from "@lucide/svelte/icons/pencil";
	import { tick } from "svelte";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import { getLocale, localizeHref } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	const chinese = $derived(getLocale() === "zh");
	const original = $derived(
		chinese ? "有哪些待验收的组件？" : "Which components are still in review?"
	);
	let saved = $state<string>();
	const message = $derived(saved ?? original);
	let draft = $state("");
	let editing = $state(false);
	let copyStatus = $state("");
	let input = $state<HTMLTextAreaElement | null>(null);
	let editButton = $state<HTMLButtonElement | null>(null);

	async function startEditing() {
		draft = message;
		editing = true;
		await tick();
		input?.focus();
	}

	async function closeEditing() {
		editing = false;
		await tick();
		editButton?.focus();
	}

	async function copyMessage() {
		try {
			await navigator.clipboard.writeText(message);
			copyStatus = chinese ? "已复制消息" : "Message copied";
		} catch {
			copyStatus = chinese ? "复制失败" : "Unable to copy message";
		}
	}
</script>

<div class="flex w-full max-w-xl min-w-0 flex-col gap-3">
	<Bubble.Root
		appearance="agent-user"
		role="group"
		aria-label={chinese ? "用户消息" : "User message"}
	>
		<Bubble.Content>
			{#if editing}
				<form
					class="grid gap-2"
					onsubmit={(event) => {
						event.preventDefault();
						if (!draft.trim()) return;
						saved = draft.trim();
						void closeEditing();
					}}
				>
					<Textarea
						bind:ref={input}
						bind:value={draft}
						aria-label={chinese ? "消息内容" : "Message text"}
						onkeydown={(event) => {
							if (event.key === "Escape") {
								event.preventDefault();
								void closeEditing();
							}
						}}
					/>
					<div class="flex flex-wrap justify-end gap-1.5">
						<Button type="button" size="xs" variant="ghost" onclick={closeEditing}>
							{chinese ? "取消" : "Cancel"}
						</Button>
						<Button type="submit" size="xs" disabled={!draft.trim()}>
							{chinese ? "保存" : "Save"}
						</Button>
					</div>
				</form>
			{:else}
				{message}
			{/if}
		</Bubble.Content>
		{#if !editing}
			<Bubble.Actions role="group" aria-label={chinese ? "消息操作" : "Message actions"}>
				<Button
					type="button"
					size="icon-xs"
					variant="ghost"
					data-slot="bubble-action"
					aria-label={chinese ? "复制消息" : "Copy message"}
					onclick={copyMessage}
				>
					<Copy aria-hidden="true" />
				</Button>
				<Button
					type="button"
					bind:ref={editButton}
					size="icon-xs"
					variant="ghost"
					data-slot="bubble-action"
					aria-label={chinese ? "编辑消息" : "Edit message"}
					onclick={startEditing}
				>
					<Pencil aria-hidden="true" />
				</Button>
			</Bubble.Actions>
		{/if}
		<span role="status" class="sr-only">{copyStatus}</span>
	</Bubble.Root>
	<Bubble.Root
		appearance="agent-assistant"
		role="group"
		aria-label={chinese ? "助手消息" : "Assistant message"}
	>
		<Bubble.Content>
			<p>
				{chinese ? "查看" : "See the "}<a href={localizeHref("/docs/components", getLocale())}
					>{chinese ? "基础组件目录" : "component catalog"}</a
				>{chinese ? "中已完成验收的组件。" : " for the reviewed components."}
			</p>
		</Bubble.Content>
	</Bubble.Root>
</div>
