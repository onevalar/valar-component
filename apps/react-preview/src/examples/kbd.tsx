import { Button } from "@valar/react-ui/button";
import { Kbd, KbdGroup } from "@valar/react-ui/kbd";
import { useState } from "react";

export default function KbdExample() {
	const [status, setStatus] = useState("Awaiting confirmation");

	return (
		<section
			aria-label="Kbd examples"
			className="grid max-w-sm gap-4 p-6 text-sm"
			onKeyDown={(event) => {
				if (
					event.shiftKey &&
					!event.altKey &&
					!event.ctrlKey &&
					!event.metaKey &&
					event.key.toLowerCase() === "r"
				) {
					event.preventDefault();
					setStatus("Awaiting confirmation");
				}
			}}
		>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="outline" aria-keyshortcuts="Enter" onClick={() => setStatus("Confirmed")}>
					Confirm <Kbd aria-hidden="true">Enter</Kbd>
				</Button>
				<Button
					variant="ghost"
					aria-keyshortcuts="Shift+R"
					onClick={() => setStatus("Awaiting confirmation")}
				>
					Reset
					<KbdGroup aria-hidden="true">
						<Kbd appearance="inline">Shift</Kbd>
						<Kbd appearance="inline">R</Kbd>
					</KbdGroup>
				</Button>
			</div>
			<output className="text-muted-foreground">{status}</output>
		</section>
	);
}
