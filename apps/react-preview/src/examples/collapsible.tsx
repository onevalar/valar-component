import { Badge } from "@valar/react-ui/badge";
import { Button } from "@valar/react-ui/button";
import { Card, CardContent } from "@valar/react-ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/react-ui/collapsible";
import { PageLayoutPropertyList, PageLayoutPropertyRow } from "@valar/react-ui/page-layout";

export default function CollapsibleExample() {
	return (
		<section aria-label="Collapsible examples" className="grid w-full max-w-sm gap-4 p-6 text-sm">
			<Card size="sm">
				<CardContent>
					<Collapsible appearance="properties">
						<CollapsibleTrigger>
							<svg
								aria-hidden="true"
								data-slot="collapsible-indicator"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="m6 4 4 4-4 4" />
							</svg>
							Properties
						</CollapsibleTrigger>
						<CollapsibleContent className="px-2 pt-2">
							<PageLayoutPropertyList layout="detail">
								<PageLayoutPropertyRow label="Status" layout="detail">
									<Badge variant="secondary">In progress</Badge>
								</PageLayoutPropertyRow>
								<PageLayoutPropertyRow label="Lead" layout="detail">
									Jordan Davis
								</PageLayoutPropertyRow>
							</PageLayoutPropertyList>
						</CollapsibleContent>
					</Collapsible>
				</CardContent>
			</Card>
			<Collapsible disabled>
				<CollapsibleTrigger asChild>
					<Button variant="outline" size="sm">
						Archived settings
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="pt-2 text-muted-foreground">
					Archived settings cannot be changed.
				</CollapsibleContent>
			</Collapsible>
		</section>
	);
}
