<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/vue-ui/collapsible";
import { defineComponent, h, ref, type PropType, type VNode } from "vue";

defineProps<{ chinese?: boolean }>();

type FileNode = { name: string; path: string } & (
	| { type: "file" }
	| { type: "folder"; children: FileNode[] }
);
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
				children: [{ type: "file", name: "button.tsx", path: "components/ui/button.tsx" }],
			},
			{ type: "file", name: "login-form.tsx", path: "components/login-form.tsx" },
		],
	},
];
const rowClass =
	"h-7 w-full min-w-0 justify-start gap-1.5 rounded-lg px-2 text-[13px] font-normal text-foreground/85 hover:bg-accent [&_svg]:size-3.5";
const paths = {
	chevron: "m6 4 4 4-4 4",
	folder: "M2 5h5l1.5 1.5H14v6H2z",
	file: "M4 2h5l3 3v9H4zM9 2v3h3",
};
function icon(kind: keyof typeof paths) {
	return h(
		"svg",
		{
			"aria-hidden": "true",
			class:
				kind === "chevron"
					? "text-muted-foreground group-aria-expanded/button:rotate-90 motion-safe:transition-transform"
					: "text-muted-foreground",
			viewBox: "0 0 16 16",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": 1.25,
			"stroke-linejoin": "round",
			"stroke-linecap": "round",
		},
		[h("path", { d: paths[kind] })]
	);
}

// A local recursive renderer keeps the example copyable under any filename.
const FileTreeNode = defineComponent({
	props: {
		node: { type: Object as PropType<FileNode>, required: true },
		selected: { type: String, required: true },
	},
	emits: { select: (path: string) => typeof path === "string" },
	setup(props, { emit }) {
		return (): VNode => {
			const node = props.node;
			const name = () => h("span", { class: "truncate" }, node.name);
			const button = { variant: "ghost" as const, size: "sm" as const, shape: "square" as const };
			return h(
				"li",
				{ class: "min-w-0" },
				node.type === "folder"
					? [
							h(
								Collapsible,
								{ defaultOpen: true },
								{
									default: () => [
										h(
											CollapsibleTrigger,
											{ asChild: true },
											{
												default: () =>
													h(
														Button,
														{ ...button, class: rowClass },
														{ default: () => [icon("chevron"), icon("folder"), name()] }
													),
											}
										),
										h(CollapsibleContent, null, {
											default: () =>
												h(
													"ul",
													{ class: "ms-3.5 border-s-[0.5px] border-border ps-1" },
													node.children.map((child) =>
														h(FileTreeNode, {
															key: child.path,
															node: child,
															selected: props.selected,
															onSelect: (path) => emit("select", path),
														})
													)
												),
										}),
									],
								}
							),
						]
					: [
							h(
								Button,
								{
									...button,
									class: `${rowClass} aria-[current=true]:bg-accent aria-[current=true]:font-medium aria-[current=true]:text-foreground`,
									"aria-current": props.selected === node.path ? "true" : undefined,
									onClick: () => emit("select", node.path),
								},
								{ default: () => [icon("file"), name()] }
							),
						]
			);
		};
	},
});
const selected = ref("components/ui/button.tsx");
</script>

<template>
	<section
		:lang="chinese ? 'zh-CN' : 'en'"
		:aria-label="chinese ? '已更改的文件' : 'Changed files'"
		class="grid w-full max-w-xs min-w-0 gap-2 p-4"
	>
		<ul class="rounded-[10px] border-[0.5px] border-border bg-card p-1.5">
			<FileTreeNode
				v-for="node in files"
				:key="node.path"
				:node="node"
				:selected="selected"
				@select="selected = $event"
			/>
		</ul>
		<p role="status" class="text-xs wrap-anywhere text-muted-foreground">
			{{ chinese ? "已选文件：" : "Selected: " }}<code>{{ selected }}</code>
		</p>
	</section>
</template>
