<script lang="ts">
	import Copy from "@lucide/svelte/icons/copy";
	import { tick } from "svelte";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Marker from "$lib/registry/ui/marker/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const reply = $derived(
		text(
			"先验证窄屏，再检查键盘操作。",
			"Review the narrow layout, then check the keyboard interactions."
		)
	);
	let phase = $state<"streaming" | "done" | "stopped">("done");
	let feedback = $state("");
	let responseButton = $state<HTMLButtonElement | null>(null);

	async function copyReply() {
		try {
			await navigator.clipboard.writeText(reply);
			feedback = text("已复制", "Copied");
		} catch {
			feedback = text("复制失败", "Could not copy");
		}
	}
</script>

<div class="mx-auto grid w-full max-w-xl min-w-0 gap-6">
	<Message.Root appearance="agent" align="end" role="group" aria-label={text("提问", "Prompt")}>
		<Message.Content>
			<Bubble.Root appearance="agent-user">
				<Bubble.Content
					>{text("怎么验收这个组件？", "How should we review this component?")}</Bubble.Content
				>
			</Bubble.Root>
		</Message.Content>
	</Message.Root>
	<Message.Root appearance="agent" role="group" aria-label={text("助手回复", "Agent response")}>
		<Message.Content>
			{#if phase === "streaming"}
				<Marker.Root role="status">
					<Marker.Content class="motion-safe:shimmer">{text("思考中…", "Thinking…")}</Marker.Content
					>
				</Marker.Root>
			{:else if phase === "stopped"}
				<Marker.Root role="status"
					><Marker.Content>{text("已停止回复", "Response stopped")}</Marker.Content></Marker.Root
				>
			{:else}
				<Bubble.Root appearance="agent-assistant">
					<Bubble.Content>{reply}</Bubble.Content>
				</Bubble.Root>
				<Message.Footer>
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label={text("复制回复", "Copy response")}
						onclick={copyReply}
					>
						<Copy aria-hidden="true" />
					</Button>
					<span role="status">{feedback}</span>
				</Message.Footer>
			{/if}
		</Message.Content>
	</Message.Root>
	<div class="flex flex-wrap gap-2">
		<Button
			variant="outline"
			size="xs"
			bind:ref={responseButton}
			onclick={() => {
				feedback = "";
				phase = phase === "streaming" ? "stopped" : "streaming";
			}}
		>
			{phase === "streaming"
				? text("停止回复", "Stop response")
				: text("模拟回复", "Simulate response")}
		</Button>
		{#if phase === "streaming"}
			<Button
				variant="outline"
				size="xs"
				onclick={async () => {
					phase = "done";
					await tick();
					responseButton?.focus();
				}}
			>
				{text("完成回复", "Complete response")}
			</Button>
		{/if}
	</div>
</div>
