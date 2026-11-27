import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@valar/react-ui/breadcrumb";
import { useId } from "react";

export default function BreadcrumbExample() {
	const id = useId();

	return (
		<section aria-label="Breadcrumb examples" className="grid w-full max-w-lg gap-3 p-6 text-sm">
			<Breadcrumb appearance="workspace" aria-label="Issue path">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href={`#${id}-workspace`}>Workspace</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href={`#${id}-issues`}>My issues</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage title="VLR-42 · Preserve filters after refreshing the issue list">
							VLR-42 · Preserve filters after refreshing the issue list
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="grid gap-3 rounded-lg border-[0.5px] border-border bg-card p-3">
				<div>
					<h2 id={`${id}-workspace`} className="font-medium">
						Workspace
					</h2>
					<p className="text-muted-foreground">Design Systems team</p>
				</div>
				<div>
					<h2 id={`${id}-issues`} className="font-medium">
						My issues
					</h2>
					<p className="text-muted-foreground">3 issues assigned to you</p>
				</div>
			</div>
		</section>
	);
}
