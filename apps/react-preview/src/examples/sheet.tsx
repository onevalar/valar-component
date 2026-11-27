import { Button } from "@valar/react-ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetTitle,
	SheetTrigger,
} from "@valar/react-ui/sheet";
import { useId, useRef, useState } from "react";

export default function SheetExample() {
	const panelId = useId();
	const panelTrigger = useRef<HTMLButtonElement>(null);
	const [panelOpen, setPanelOpen] = useState(false);
	const [pinned, setPinned] = useState(false);

	return (
		<section
			aria-label="Sheet examples"
			className="grid w-full max-w-3xl content-start items-start gap-3 p-6 text-sm md:grid-cols-[minmax(0,1fr)_auto]"
		>
			<div className="grid gap-3">
				<h2 className="font-medium">Launch plan</h2>
				<div className="flex flex-wrap gap-2">
					<Sheet>
						<SheetTrigger asChild>
							<Button size="sm" variant="outline">
								Open project details
							</Button>
						</SheetTrigger>
						<SheetContent side="right" closeLabel="Close project details">
							<SheetHeader>
								<SheetTitle>Project details</SheetTitle>
								<SheetDescription>Launch plan for the Design Systems team.</SheetDescription>
							</SheetHeader>
							<dl className="grid min-h-0 flex-1 grid-cols-[auto_1fr] content-start gap-x-3 gap-y-2 overflow-y-auto px-4">
								<dt className="text-muted-foreground">Lead</dt>
								<dd>Jordan Davis</dd>
								<dt className="text-muted-foreground">Status</dt>
								<dd>In progress</dd>
							</dl>
							<SheetFooter>
								<SheetClose asChild>
									<Button size="sm" variant="outline">
										Done
									</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
					<Button
						ref={panelTrigger}
						size="sm"
						variant="outline"
						aria-expanded={panelOpen}
						aria-controls={panelId}
						onClick={() => setPanelOpen(!panelOpen)}
					>
						Project activity
					</Button>
				</div>
			</div>
			<SheetPanel
				id={panelId}
				label="Project activity"
				open={panelOpen}
				onOpenChange={setPanelOpen}
				trigger={panelTrigger}
				className="max-h-64 md:w-[400px]"
			>
				<div className="grid justify-items-start gap-2 rounded-lg border-[0.5px] border-border bg-card p-3">
					<h3 className="font-medium">Activity</h3>
					<p className="text-muted-foreground">Jordan updated the launch checklist.</p>
					<Button
						size="sm"
						variant="outline"
						aria-pressed={pinned}
						onClick={() => setPinned(!pinned)}
					>
						Pin update
					</Button>
				</div>
			</SheetPanel>
		</section>
	);
}
