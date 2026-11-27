import { Button } from "@valar/react-ui/button";
import { Spinner } from "@valar/react-ui/spinner";
import { useState } from "react";

export default function SpinnerExample() {
	const [syncing, setSyncing] = useState(true);

	return (
		<section
			aria-label="Spinner examples"
			className="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
		>
			<div
				role="status"
				className="flex min-h-8 items-center gap-2 rounded-lg border-[0.5px] border-border bg-card px-3 text-muted-foreground"
			>
				{syncing && <Spinner aria-hidden="true" />}
				{syncing ? "Syncing project updates…" : "Project updates synced."}
			</div>
			<Button variant="outline" size="sm" onClick={() => setSyncing(!syncing)}>
				{syncing ? "Finish sync" : "Sync again"}
			</Button>
		</section>
	);
}
