import { Badge } from "@valar/react-ui/badge";
import { Button } from "@valar/react-ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@valar/react-ui/card";
import { Switch } from "@valar/react-ui/switch";
import { useId, useState } from "react";

export default function CardExample() {
	const updatesId = useId();
	const [following, setFollowing] = useState(false);

	return (
		<section aria-label="Card examples" className="grid w-full max-w-lg gap-4 p-6 text-sm">
			<Card>
				<CardHeader>
					<CardTitle>Workspace refresh</CardTitle>
					<CardDescription>Improve the speed and readability of the issue list.</CardDescription>
					<CardAction>
						<Button
							size="sm"
							variant={following ? "secondary" : "outline"}
							aria-pressed={following}
							onClick={() => setFollowing(!following)}
						>
							Follow project
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">In progress</Badge>
					<span className="text-muted-foreground">8 open issues</span>
				</CardContent>
				<CardFooter className="text-xs text-muted-foreground">Updated today</CardFooter>
			</Card>
			<Card size="sm">
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap items-center justify-between gap-2">
					<label htmlFor={updatesId}>Weekly project summary</label>
					<Switch id={updatesId} appearance="settings" size="sm" defaultChecked />
				</CardContent>
			</Card>
		</section>
	);
}
