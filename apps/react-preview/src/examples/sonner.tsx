import { Button } from "@valar/react-ui/button";
import { Toaster, toast } from "@valar/react-ui/sonner";
import { useState } from "react";

export default function SonnerExample() {
	const [archived, setArchived] = useState(false);
	function archive() {
		setArchived(true);
		toast.success("Issue archived", {
			id: "issue-archive",
			description: "VLR-42 · Workspace filters",
			duration: 8000,
			action: { label: "Undo", onClick: () => setArchived(false) },
		});
	}

	return (
		<section aria-label="Sonner examples" className="grid justify-items-start gap-3 p-6 text-sm">
			<p>Workspace filters · {archived ? "Archived" : "Open"}</p>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline" onClick={archive}>
					Archive issue
				</Button>
				<Button
					variant="outline"
					onClick={() => toast.info("Notifications are up to date", { id: "sync" })}
				>
					Show status
				</Button>
			</div>
			<Toaster appearance="workspace" containerAriaLabel="Workspace notifications" />
		</section>
	);
}
