import { Badge } from "@valar/react-ui/badge";
import { Button } from "@valar/react-ui/button";
import {
	PageLayout,
	PageLayoutActions,
	PageLayoutHeader,
	PageLayoutPropertyList,
	PageLayoutPropertyRow,
	PageLayoutSection,
	PageLayoutSectionTitle,
	PageLayoutTitle,
	PageLayoutToolbar,
} from "@valar/react-ui/page-layout";
import { Switch } from "@valar/react-ui/switch";
import { useId, useState } from "react";

export default function PageLayoutExample() {
	const [narrow, setNarrow] = useState(true);
	const settingsId = useId();
	const summaryId = useId();

	return (
		<section aria-label="Page Layout examples" className="w-full min-w-0 p-6 text-sm">
			<PageLayout width={narrow ? "narrow" : "full"}>
				<PageLayoutHeader>
					<PageLayoutTitle tag="h2">Project preferences</PageLayoutTitle>
					<PageLayoutActions>
						<Button
							variant="outline"
							size="sm"
							aria-pressed={narrow}
							onClick={() => setNarrow(!narrow)}
						>
							Narrow layout
						</Button>
					</PageLayoutActions>
				</PageLayoutHeader>
				<PageLayoutToolbar>
					<p className="text-muted-foreground">Design Systems</p>
					<Badge variant="outline">Workspace settings</Badge>
				</PageLayoutToolbar>
				<PageLayoutSection surface="card" aria-labelledby={settingsId}>
					<PageLayoutSectionTitle id={settingsId} className="px-4 pt-3">
						Notifications
					</PageLayoutSectionTitle>
					<PageLayoutPropertyList>
						<PageLayoutPropertyRow
							label="Weekly summary"
							description="Email project updates every Monday."
						>
							<Switch appearance="settings" defaultChecked aria-label="Weekly summary" />
						</PageLayoutPropertyRow>
						<PageLayoutPropertyRow
							label="Issue reminders"
							description="Send a reminder before an issue is due."
						>
							<Switch appearance="settings" aria-label="Issue reminders" />
						</PageLayoutPropertyRow>
					</PageLayoutPropertyList>
				</PageLayoutSection>
				<PageLayoutSection aria-labelledby={summaryId}>
					<PageLayoutSectionTitle id={summaryId}>Workspace details</PageLayoutSectionTitle>
					<PageLayoutPropertyList layout="detail">
						<PageLayoutPropertyRow label="Members" layout="detail">
							14
						</PageLayoutPropertyRow>
						<PageLayoutPropertyRow label="Active projects" layout="detail">
							3
						</PageLayoutPropertyRow>
					</PageLayoutPropertyList>
				</PageLayoutSection>
			</PageLayout>
		</section>
	);
}
