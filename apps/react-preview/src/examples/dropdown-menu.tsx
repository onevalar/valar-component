import { Button } from "@valar/react-ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import { useState } from "react";

export default function DropdownMenuExample() {
	const [showCompleted, setShowCompleted] = useState(false);
	const [refreshCount, setRefreshCount] = useState(0);

	return (
		<section
			aria-label="Dropdown Menu examples"
			className="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">View options</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="min-w-44">
					<DropdownMenuCheckboxItem checked={showCompleted} onCheckedChange={setShowCompleted}>
						Show completed
					</DropdownMenuCheckboxItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => setRefreshCount((count) => count + 1)}>
						Refresh issues
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ul
				aria-label="Launch issues"
				className="grid gap-1 rounded-lg border-[0.5px] border-border bg-card p-3"
			>
				<li>Review launch checklist</li>
				{showCompleted && (
					<li>
						Confirm launch date <span className="text-muted-foreground">· Done</span>
					</li>
				)}
			</ul>
			<p role="status" className="text-muted-foreground">
				Refresh count: {refreshCount}
			</p>
		</section>
	);
}
