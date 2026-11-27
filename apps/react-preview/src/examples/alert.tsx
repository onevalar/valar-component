import { Alert, AlertAction, AlertDescription, AlertTitle } from "@valar/react-ui/alert";
import { Button } from "@valar/react-ui/button";
import { useRef, useState } from "react";

export default function AlertExample() {
	const [offline, setOffline] = useState(true);
	const disconnectButton = useRef<HTMLButtonElement>(null);

	return (
		<section aria-label="Alert examples" className="grid w-full max-w-lg gap-4 p-6 text-sm">
			<Alert role="status">
				<AlertTitle>Draft saved</AlertTitle>
				<AlertDescription>
					Your teammates won’t see the draft until you publish it.
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTitle>Import failed</AlertTitle>
				<AlertDescription>The CSV is missing a Title column.</AlertDescription>
			</Alert>
			<div className="flex flex-wrap items-center gap-2">
				<Button ref={disconnectButton} size="sm" variant="outline" onClick={() => setOffline(true)}>
					Simulate disconnect
				</Button>
				{offline ? (
					<Alert appearance="connection">
						<AlertTitle>Offline</AlertTitle>
						<AlertAction>
							<Button
								variant="ghost"
								size="xs"
								onClick={() => {
									setOffline(false);
									disconnectButton.current?.focus();
								}}
							>
								Retry connection
							</Button>
						</AlertAction>
					</Alert>
				) : (
					<p role="status" className="text-xs text-muted-foreground">
						Connection restored.
					</p>
				)}
			</div>
		</section>
	);
}
