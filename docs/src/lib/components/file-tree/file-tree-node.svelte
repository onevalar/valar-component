<script lang="ts" module>
	export type FileNode =
		| { type: "file"; name: string; path: string }
		| { type: "folder"; name: string; path: string; children: FileNode[] };
</script>

<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import FileIcon from "@lucide/svelte/icons/file";
	import FolderIcon from "@lucide/svelte/icons/folder";
	import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import FileTreeNode from "./file-tree-node.svelte";

	let {
		node,
		selected,
		onSelect,
	}: {
		node: FileNode;
		selected: string;
		onSelect: (path: string) => void;
	} = $props();
</script>

{#if node.type === "folder"}
	<Collapsible.Root open class="group/folder">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="sm"
					shape="square"
					class="h-7 w-full justify-start rounded-[8px] px-2 text-[13px] font-normal text-foreground/85 hover:bg-[#F3F3F5] hover:text-foreground dark:hover:bg-[#1C1D20] aria-expanded:bg-transparent aria-expanded:hover:bg-[#F3F3F5] dark:aria-expanded:hover:bg-[#1C1D20] [&_svg:not([class*='size-'])]:size-3.5"
				>
					<ChevronRightIcon class="text-muted-foreground transition-transform group-data-[state=open]/folder:rotate-90" />
					<FolderIcon class="text-muted-foreground" />
					{node.name}
				</Button>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content>
			<div class="ml-3.5 flex flex-col border-l-[0.5px] border-border/70 pl-1">
				{#each node.children as child (child.path)}
					<FileTreeNode node={child} {selected} {onSelect} />
				{/each}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
{:else}
	<Button
		variant="ghost"
		size="sm"
		shape="square"
		class={cn(
			"h-7 w-full justify-start rounded-[8px] px-2 text-[13px] font-normal text-foreground/85 hover:bg-[#F3F3F5] hover:text-foreground dark:hover:bg-[#1C1D20] [&_svg:not([class*='size-'])]:size-3.5",
			selected === node.path &&
				"bg-[#F3F3F5] font-medium text-foreground dark:bg-[#1E1F23] dark:text-foreground"
		)}
		aria-current={selected === node.path ? "true" : undefined}
		onclick={() => onSelect(node.path)}
	>
		<FileIcon class="text-muted-foreground" />
		{node.name}
	</Button>
{/if}
