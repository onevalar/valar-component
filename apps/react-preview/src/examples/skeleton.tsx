import { Avatar, AvatarFallback } from "@valar/react-ui/avatar";
import { Button } from "@valar/react-ui/button";
import { Card, CardContent } from "@valar/react-ui/card";
import { Skeleton } from "@valar/react-ui/skeleton";
import { useState } from "react";

export default function SkeletonExample() {
	const [loading, setLoading] = useState(true);

	return (
		<section aria-label="Skeleton examples" className="grid w-full max-w-sm gap-3 p-6 text-sm">
			<Button
				size="sm"
				variant="outline"
				className="justify-self-start"
				onClick={() => setLoading(!loading)}
			>
				{loading ? "Show project lead" : "Show loading state"}
			</Button>
			<p role="status" className="sr-only">
				{loading ? "Loading project lead" : "Project lead loaded"}
			</p>
			<Card size="sm" aria-busy={loading}>
				<CardContent className="flex min-h-10 items-center gap-3">
					{loading ? (
						<>
							<Skeleton className="size-8 shrink-0 rounded-full" />
							<div className="grid min-w-0 flex-1 gap-2">
								<Skeleton className="h-3 w-24 max-w-full" />
								<Skeleton className="h-2.5 w-40 max-w-full" />
							</div>
						</>
					) : (
						<>
							<Avatar aria-hidden="true">
								<AvatarFallback>JD</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">Jane Doe</p>
								<p className="text-xs text-muted-foreground">Project lead · Design Systems</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</section>
	);
}
