import { Button } from "@valar/react-ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@valar/react-ui/context-menu";
import { useState } from "react";

const statuses = ["Todo", "In progress", "Done"];

export default function ContextMenuExample() {
	const [status, setStatus] = useState("Todo");

	return (
		<section aria-label="Context Menu examples" className="grid w-full max-w-sm gap-3 p-6 text-sm">
			<ContextMenu>
				<ContextMenuTrigger
					role="group"
					aria-label="Issue VAL-42"
					tabIndex={0}
					className="grid gap-1 rounded-lg border-[0.5px] border-border bg-card p-3 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
				>
					<p className="font-medium">VAL-42 · Review launch checklist</p>
					<p role="status" className="text-muted-foreground">
						Status: {status}
					</p>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onSelect={() => setStatus("Todo")}>Move to Todo</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							{statuses.slice(1).map((value) => (
								<ContextMenuItem key={value} onSelect={() => setStatus(value)}>
									{value}
								</ContextMenuItem>
							))}
						</ContextMenuSubContent>
					</ContextMenuSub>
				</ContextMenuContent>
			</ContextMenu>
			<div role="group" aria-label="Set issue status" className="flex flex-wrap gap-2">
				{statuses.map((value) => (
					<Button
						key={value}
						size="sm"
						variant="outline"
						aria-pressed={status === value}
						onClick={() => setStatus(value)}
					>
						{value}
					</Button>
				))}
			</div>
		</section>
	);
}
