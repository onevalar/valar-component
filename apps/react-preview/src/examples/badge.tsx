import { Badge } from "@valar/react-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@valar/react-ui/card";

export default function BadgeExample() {
	return (
		<section aria-label="Badge examples" className="w-full max-w-md p-6 text-sm">
			<Card size="sm">
				<CardHeader>
					<CardTitle>VLR-42 · Preserve issue filters</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3">
					<div className="flex flex-wrap gap-2">
						<Badge variant="label" labelColor="var(--red)">
							Bug
						</Badge>
						<Badge variant="label" labelColor="var(--blue)">
							Workspace
						</Badge>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">In progress</Badge>
						<Badge variant="destructive">Blocked</Badge>
						<Badge variant="outline">Needs review</Badge>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
