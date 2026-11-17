<script lang="ts">
	import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { getLocale } from "$lib/i18n/index.js";

	let {
		source,
		onTroubleshoot,
		onRemove
	}: {
		source: string;
		onTroubleshoot: () => void;
		onRemove: () => void;
	} = $props();
	let open = $state(false);
	let filter = $state<HTMLInputElement | null>(null);
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);

	function select(action: () => void) {
		open = false;
		action();
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				shape="pill"
				aria-label={text(`${source} 导入操作`, `Open ${source} import menu`)}
			>
				<EllipsisIcon aria-hidden="true" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		role="dialog"
		aria-label={text("导入操作", "Import actions")}
		appearance="surface"
		align="end"
		class="w-52 max-w-[calc(100vw-16px)] p-0"
		onOpenAutoFocus={(event) => {
			if (!filter) return;
			event.preventDefault();
			filter.focus();
		}}
	>
	<Command.Root appearance="compact" label={text("筛选操作", "Filter actions")}>
			<Command.Input
				bind:ref={filter}
				placeholder={text("筛选…", "Filter…")}
			/>
			<Command.List>
				<Command.Empty>{text("没有匹配的操作", "No matching actions")}</Command.Empty>
				<Command.Item onSelect={() => select(onTroubleshoot)}>
					{text("排查导入问题", "Troubleshoot import")}
				</Command.Item>
				<Command.Item onSelect={() => select(onRemove)} class="text-destructive">
					{text("删除导入", "Delete import")}
				</Command.Item>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
