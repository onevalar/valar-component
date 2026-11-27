import { useState } from "react";
import { IssueDetail, type IssueDetailValue } from "@valar/react-ui/issue-detail";

export default function IssueDetailExample() {
	const [issue, setIssue] = useState<IssueDetailValue>({
		id: "DOC-24",
		title: "Review the release notes",
		description: "Add the keyboard checks and example screenshots before handing off the draft.",
		status: "todo",
		priority: "medium",
	});
	return <IssueDetail issue={issue} onUpdate={(update) => setIssue((current) => ({ ...current, ...update }))} />;
}
