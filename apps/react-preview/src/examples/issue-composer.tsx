import { useState } from "react";
import { Button } from "@valar/react-ui/button";
import { IssueComposer, type IssueDraft } from "@valar/react-ui/issue-composer";

export default function IssueComposerExample() {
	const [open, setOpen] = useState(false);
	const [issues, setIssues] = useState<IssueDraft[]>([]);
	return (
		<div className="grid justify-items-start gap-3">
			<Button onClick={() => setOpen(true)}>New issue</Button>
			<IssueComposer open={open} onOpenChange={setOpen} onCreate={(issue) => setIssues((list) => [...list, issue])} />
			<ul aria-label="Created issues" className="grid gap-1">
				{issues.map((issue, index) => <li key={index}>{issue.title} · {issue.status} · {issue.attachments.length} files</li>)}
			</ul>
		</div>
	);
}
