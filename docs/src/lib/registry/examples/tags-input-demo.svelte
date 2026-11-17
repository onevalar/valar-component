<script lang="ts">
	import { TagsInput } from "$lib/registry/ui/tags-input/index.js";
	const uid = $props.id();
	let tags = $state(["Svelte", "中文"]);
</script>

<div class="grid w-full max-w-sm gap-3">
	<label for={`${uid}-tags`} class="text-sm font-medium">技术标签 / Tags</label>
	<TagsInput
		id={`${uid}-tags`}
		bind:value={tags}
		placeholder="输入后按 Enter，或粘贴多项"
		aria-describedby={`${uid}-hint`}
	/>
	<p id={`${uid}-hint`} class="text-xs text-muted-foreground">
		逗号分隔；空输入时 Backspace 先选中标签，再按一次删除。
	</p>
	<output class="text-sm break-all text-muted-foreground">{JSON.stringify(tags)}</output>
	<div class="grid min-w-0 gap-2">
		<label for={`${uid}-readonly`} class="text-sm font-medium">只读 / Read-only</label>
		<TagsInput id={`${uid}-readonly`} defaultValue={["Inherited"]} readonly />
	</div>
	<div class="grid min-w-0 gap-2">
		<label for={`${uid}-disabled`} class="text-sm font-medium">禁用 / Disabled</label>
		<TagsInput id={`${uid}-disabled`} defaultValue={["Archived"]} disabled />
	</div>
</div>
