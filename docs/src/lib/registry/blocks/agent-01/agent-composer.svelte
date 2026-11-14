<script lang="ts">
	import * as Menu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import AgentAttachments from "./agent-attachments.svelte";
	import type { Draft } from "./data.js";

	let {
		draft,
		active,
		running,
		chinese,
		portal,
		onText,
		onFiles,
		onRemove,
		onSend,
		onStop,
	}: {
		draft: Draft;
		active: boolean;
		running: boolean;
		chinese: boolean;
		portal: { to: string };
		onText: (value: string) => void;
		onFiles: (files: File[]) => void;
		onRemove: (id: number) => void;
		onSend: () => void;
		onStop: () => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	let input: HTMLTextAreaElement | null = $state(null);
	let picker: HTMLInputElement;
	const ready = $derived(
		!!(draft.text.trim() || draft.files.length) &&
			draft.files.every((file) => file.state === "done")
	);
	const button = "size-6 rounded-full p-0 shadow-none [&_svg]:size-3.5";

	export function focus() {
		input?.focus({ preventScroll: true });
	}

	function send() {
		if (!running && ready) onSend();
	}

	function keys(event: KeyboardEvent) {
		if (event.isComposing || event.keyCode === 229) return;
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			send();
		}
		if (event.key.toLowerCase() === "u" && (event.metaKey || event.ctrlKey) && event.shiftKey) {
			event.preventDefault();
			picker.click();
		}
	}

	function paste(event: ClipboardEvent) {
		const files = Array.from(event.clipboardData?.files ?? []);
		if (files.length) onFiles(files);
	}

	function dragOver(event: DragEvent) {
		if (!event.dataTransfer?.types.includes("Files")) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	}

	function drop(event: DragEvent) {
		const files = Array.from(event.dataTransfer?.files ?? []);
		if (!files.length) return;
		event.preventDefault();
		onFiles(files);
		focus();
	}
</script>

<form
	aria-label={text("对话输入", "Chat composer")}
	onsubmit={(event) => {
		event.preventDefault();
		send();
	}}
	ondragover={dragOver}
	ondrop={drop}
>
	<span class="sr-only" role="status"
		>{running ? text("Agent 正在回复", "Agent is responding") : ""}</span
	>
	<InputGroup.Root
		style={active
			? "background-color: var(--agent-reply)"
			: "background-color: var(--agent-composer)"}
		class="flex h-auto flex-col items-stretch gap-2 rounded-xl border border-border px-3 pt-4 pb-2.5 shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-(--agent-focus) has-[[data-slot=input-group-control]:focus-visible]:ring-0 sm:px-4"
	>
		<div class="flex max-h-[min(35svh,17rem)] flex-col gap-2 overflow-y-auto">
			<AgentAttachments files={draft.files} {chinese} {onRemove} />
			<InputGroup.Textarea
				bind:ref={input}
				value={draft.text}
				oninput={(event) => onText(event.currentTarget.value)}
				aria-label={text("发送消息给 Agent", "Message Agent")}
				placeholder={active ? text("回复…", "Reply…") : text("问问 Agent…", "Ask Agent…")}
				rows={1}
				class={[
					"field-sizing-content max-h-36 w-full flex-none rounded-none border-0 bg-transparent p-0 text-[15px] leading-6 shadow-none outline-none placeholder:text-(--agent-placeholder) placeholder:opacity-100 focus-visible:ring-0 md:text-[15px]",
					active ? "min-h-[68px]" : "min-h-11",
				]}
				onkeydown={keys}
				onpaste={paste}
			/>
		</div>
		<div class="flex items-center justify-end gap-2">
			<input
				bind:this={picker}
				hidden
				type="file"
				multiple
				onchange={(event) => {
					onFiles(Array.from(event.currentTarget.files ?? []));
					event.currentTarget.value = "";
					focus();
				}}
			/>
			<Menu.Root>
				<Tooltip.Hint label={text("添加附件", "Add files")} {portal} side="top">
					{#snippet trigger({ props })}
						<Menu.Trigger
							{...props}
							aria-label={text("添加附件", "Add files")}
							class={button + " text-muted-foreground hover:bg-accent hover:text-foreground"}
						>
							<IconPlaceholder
								lucide="PlusIcon"
								tabler="IconPlus"
								hugeicons="Add01Icon"
								phosphor="PlusIcon"
								remixicon="RiAddLine"
								aria-hidden="true"
							/>
						</Menu.Trigger>
					{/snippet}
				</Tooltip.Hint>
				<Menu.Content appearance="surface" portalProps={portal} align="end" class="w-48">
					<Menu.Item
						aria-keyshortcuts="Meta+Shift+U Control+Shift+U"
						onSelect={() => picker.click()}
					>
						<IconPlaceholder
							lucide="FileIcon"
							tabler="IconFile"
							hugeicons="File01Icon"
							phosphor="FileIcon"
							remixicon="RiFileLine"
							aria-hidden="true"
						/>
						{text("文件", "File")}
						<Menu.Shortcut aria-hidden="true" class="tracking-normal">Ctrl/⌘ Shift U</Menu.Shortcut>
					</Menu.Item>
				</Menu.Content>
			</Menu.Root>
			{#if running}
				<Tooltip.Hint label={text("停止回复", "Stop responding")} {portal} side="top">
					{#snippet trigger({ props })}
						<Button
							{...props}
							type="button"
							aria-label={text("停止回复", "Stop responding")}
							class={button + " bg-(--agent-send) text-white hover:bg-(--agent-send)/85"}
							onclick={onStop}
						>
							<span class="size-2 rounded-[2px] bg-current" aria-hidden="true"></span>
						</Button>
					{/snippet}
				</Tooltip.Hint>
			{:else}
				<Tooltip.Hint
					label={text("发送消息", "Send message")}
					{portal}
					side="top"
					disabled={!ready}
				>
					{#snippet trigger({ props })}
						<Button
							{...props}
							type="submit"
							disabled={!ready}
							aria-label={text("发送消息", "Send message")}
							class={button +
								" bg-(--agent-send) text-white hover:bg-(--agent-send)/85 " +
								(active
									? "disabled:bg-accent disabled:text-muted-foreground disabled:opacity-100"
									: "disabled:opacity-80")}
						>
							<IconPlaceholder
								lucide="ArrowUpIcon"
								tabler="IconArrowUp"
								hugeicons="ArrowUp02Icon"
								phosphor="ArrowUpIcon"
								remixicon="RiArrowUpLine"
								aria-hidden="true"
							/>
						</Button>
					{/snippet}
				</Tooltip.Hint>
			{/if}
		</div>
	</InputGroup.Root>
</form>
