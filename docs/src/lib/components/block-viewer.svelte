<script lang="ts" module>
	import { Pane } from "paneforge";
	import { Context } from "runed";
	import type { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
	import BlockViewerCode from "./block-viewer-code.svelte";
	import BlockViewerToolbar from "./block-viewer-toolbar.svelte";
	import BlockViewerViewMobile from "./block-viewer-view-mobile.svelte";
	import BlockViewerView from "./block-viewer-view.svelte";
	import type { HighlightedBlock } from "../../routes/api/block/[block]/+server.js";
	import type { Snippet } from "svelte";

	type BlockViewerContextType = {
		item: HighlightedBlock;
		view: "code" | "preview";
		activeFile: string | null;
		resizablePaneRef: Pane | null;
		tree: ReturnType<typeof createFileTreeForRegistryItemFiles> | null;
		iframeKey: number;
		activeFileCodeToCopy: string;
	};

	export const BlockViewerContext = new Context<BlockViewerContextType>("BlockViewer");
</script>

<script lang="ts">
	import { page } from "$app/state";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { blockTemplate } from "../../../../apps/block-template.js";

	let {
		item,
		tree,
		children,
	}: Pick<BlockViewerContextType, "item" | "tree"> & {
		children?: Snippet;
	} = $props();

	let view = $state<BlockViewerContextType["view"]>("preview");

	function getFirstFileTargetInTree(_tree: typeof tree = tree): string | null {
		if (!_tree?.length) return null;

		for (const node of _tree) {
			if (node.path) return node.path;
			if (node.children) {
				const result = getFirstFileTargetInTree(node.children);
				if (result) return result;
			}
		}
		return null;
	}

	let activeFile = $state<BlockViewerContextType["activeFile"]>(getFirstFileTargetInTree() ?? null);
	let resizablePaneRef = $state<Pane>(null!);
	let iframeKey = $state<number>(0);
	let activeFileCodeToCopy = $state<string>("");
	const locale = $derived(localeFromPathname(page.url.pathname));

	BlockViewerContext.set({
		get item() {
			return item;
		},
		get iframeKey() {
			return iframeKey;
		},
		set iframeKey(value) {
			iframeKey = value;
		},
		get view() {
			return view;
		},
		set view(value) {
			view = value;
		},
		get activeFile() {
			return activeFile;
		},
		set activeFile(value) {
			activeFile = value;
		},
		get resizablePaneRef() {
			return resizablePaneRef;
		},
		set resizablePaneRef(value) {
			resizablePaneRef = value;
		},
		get tree() {
			return tree;
		},
		get activeFileCodeToCopy() {
			return activeFileCodeToCopy;
		},
		set activeFileCodeToCopy(value) {
			activeFileCodeToCopy = value;
		},
	});
</script>

<div
	id={item.name}
	data-view={view}
	class="group/block-view-wrapper flex min-w-0 scroll-mt-24 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col"
	style="--height: {item.meta?.iframeHeight ?? '930px'}"
>
	{#if blockTemplate(item.name)}
		<a
			class="self-end rounded-sm text-sm text-muted-foreground underline underline-offset-4 focus-visible:text-foreground"
			href={localizeHref(`/block-templates/${item.name}`, locale)}
		>
			{locale === "zh" ? "Svelte / React / Vue 区块源码" : "Svelte / React / Vue block source"}
		</a>
	{/if}
	<BlockViewerToolbar />
	<BlockViewerView />
	<BlockViewerCode />
	<BlockViewerViewMobile>{@render children?.()}</BlockViewerViewMobile>
</div>
