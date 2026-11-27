"use client";

import { Button } from "@valar/react-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/react-ui/collapsible";
import { useState } from "react";

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

function Icon({ kind }: { kind: keyof typeof paths }) {
	return (
		<svg
			aria-hidden="true"
			className={
				kind === "chevron"
					? "text-muted-foreground group-aria-expanded/button:rotate-90 motion-safe:transition-transform"
					: "text-muted-foreground"
			}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.25"
			strokeLinejoin="round"
			strokeLinecap="round"
		>
			<path d={paths[kind]} />
		</svg>
	);
}

function FileTreeNode({
	node,
	selected,
	onSelect,
}: {
	node: FileNode;
	selected: string;
	onSelect: (path: string) => void;
}) {
	return (
		<li className="min-w-0">
			{node.type === "folder" ? (
				<Collapsible defaultOpen>
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" shape="square" className={rowClass}>
							<Icon kind="chevron" />
							<Icon kind="folder" />
							<span className="truncate">{node.name}</span>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<ul className="ms-3.5 border-s-[0.5px] border-border ps-1">
							{node.children.map((child) => (
								<FileTreeNode
									key={child.path}
									node={child}
									selected={selected}
									onSelect={onSelect}
								/>
							))}
						</ul>
					</CollapsibleContent>
				</Collapsible>
			) : (
				<Button
					variant="ghost"
					size="sm"
					shape="square"
					className={`${rowClass} aria-[current=true]:bg-accent aria-[current=true]:font-medium aria-[current=true]:text-foreground`}
					aria-current={selected === node.path ? "true" : undefined}
					onClick={() => onSelect(node.path)}
				>
					<Icon kind="file" />
					<span className="truncate">{node.name}</span>
				</Button>
			)}
		</li>
	);
}

export default function FileTreeExample({ chinese = false }: { chinese?: boolean }) {
	const [selected, setSelected] = useState("components/ui/button.tsx");
	return (
		<section
			lang={chinese ? "zh-CN" : "en"}
			aria-label={chinese ? "已更改的文件" : "Changed files"}
			className="grid w-full max-w-xs min-w-0 gap-2 p-4"
		>
			<ul className="rounded-[10px] border-[0.5px] border-border bg-card p-1.5">
				{files.map((node) => (
					<FileTreeNode key={node.path} node={node} selected={selected} onSelect={setSelected} />
				))}
			</ul>
			<p role="status" className="text-xs wrap-anywhere text-muted-foreground">
				{chinese ? "已选文件：" : "Selected: "}
				<code>{selected}</code>
			</p>
		</section>
	);
}
