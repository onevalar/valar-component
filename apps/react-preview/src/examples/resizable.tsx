import { Badge } from "@valar/react-ui/badge";
import { ResizableHandle, ResizablePane, ResizablePaneGroup } from "@valar/react-ui/resizable";
import { useId } from "react";

export default function ResizableExample() {
	const id = useId();

	return (
		<section aria-label="Resizable examples" className="grid w-full max-w-xl gap-2 p-6 text-sm">
			<p id={`${id}-instructions`} className="text-muted-foreground">
				Drag the divider or focus it and use the arrow keys to resize the panels.
			</p>
			<div className="h-44 overflow-hidden rounded-lg border-[0.5px] border-border bg-card">
				<ResizablePaneGroup direction="horizontal">
					<ResizablePane
						defaultSize={45}
						minSize={30}
						tagName="section"
						aria-labelledby={`${id}-projects`}
					>
						<div className="grid h-full content-start gap-2 overflow-y-auto bg-muted/50 p-2 sm:p-3">
							<h2 className="font-medium" id={`${id}-projects`}>
								Projects
							</h2>
							<ul className="grid gap-1 text-xs text-muted-foreground">
								<li className="truncate" title="Workspace refresh">
									Workspace refresh
								</li>
								<li className="truncate" title="Mobile navigation">
									Mobile navigation
								</li>
							</ul>
						</div>
					</ResizablePane>
					<ResizableHandle
						appearance="workspace"
						withHandle
						aria-label="Project panel size"
						aria-describedby={`${id}-instructions`}
					/>
					<ResizablePane
						defaultSize={55}
						minSize={30}
						tagName="section"
						aria-labelledby={`${id}-details`}
					>
						<div className="grid h-full content-start justify-items-start gap-2 overflow-y-auto p-2 sm:p-3">
							<h2 className="font-medium" id={`${id}-details`}>
								Details
							</h2>
							<p className="text-xs text-muted-foreground">Workspace refresh</p>
							<Badge variant="secondary" className="max-w-full">
								In progress
							</Badge>
						</div>
					</ResizablePane>
				</ResizablePaneGroup>
			</div>
		</section>
	);
}
