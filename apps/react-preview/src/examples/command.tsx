import { Button } from "@valar/react-ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandLinkItem,
	CommandList,
} from "@valar/react-ui/command";
import { useState } from "react";

export default function CommandExample() {
	const [open, setOpen] = useState(false);
	const [lastAction, setLastAction] = useState("No action yet");
	return (
		<section aria-label="Command examples" className="grid justify-items-start gap-4 p-6 text-sm">
			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title="Workspace commands"
				description="Search actions or jump to workspace settings."
				trigger={<Button variant="outline">Open commands</Button>}
				showCloseButton
				closeLabel="Close commands"
			>
				<CommandInput aria-label="Search commands" placeholder="Search actions…" />
				<CommandList>
					<CommandEmpty>No matching commands. Try another keyword.</CommandEmpty>
					<CommandGroup heading="Actions">
						<CommandItem
							value="new-issue"
							keywords={["create", "新建问题"]}
							onSelect={() => {
								setLastAction("New issue selected");
								setOpen(false);
							}}
						>
							New issue
						</CommandItem>
						<CommandItem value="archive" disabled>
							Archive workspace
						</CommandItem>
					</CommandGroup>
					<CommandGroup heading="Navigation">
						<CommandLinkItem
							value="settings"
							href="#command-workspace-settings"
							onSelect={() => setOpen(false)}
						>
							Workspace settings
						</CommandLinkItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
			<p role="status">{lastAction}</p>
			<h2 id="command-workspace-settings" className="font-semibold">
				Workspace settings
			</h2>
		</section>
	);
}
