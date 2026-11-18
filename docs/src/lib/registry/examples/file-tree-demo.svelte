<script lang="ts">
	import FileTreeNode, { type FileNode } from "$lib/components/file-tree/file-tree-node.svelte";

	const files: FileNode[] = [
		{
			type: "folder",
			name: "app",
			path: "app",
			children: [
				{ type: "file", name: "layout.tsx", path: "app/layout.tsx" },
				{ type: "file", name: "page.tsx", path: "app/page.tsx" },
			],
		},
		{
			type: "folder",
			name: "components",
			path: "components",
			children: [
				{
					type: "folder",
					name: "ui",
					path: "components/ui",
					children: [
						{
							type: "file",
							name: "button.tsx",
							path: "components/ui/button.tsx",
						},
					],
				},
				{
					type: "file",
					name: "login-form.tsx",
					path: "components/login-form.tsx",
				},
			],
		},
	];

	let selected = $state("components/ui/button.tsx");
</script>

<div class="flex w-full max-w-xs flex-col py-6">
	<div
		class="flex flex-col gap-0.5 rounded-[10px] border-[0.5px] border-border bg-card p-1.5 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
	>
		{#each files as node (node.path)}
			<FileTreeNode {node} {selected} onSelect={(path) => (selected = path)} />
		{/each}
	</div>
</div>
