"use client";

import { Button } from "@valar/react-ui/button";
import { IssueComposer, issueLabels, type IssueDraft } from "@valar/react-ui/issue-composer";
import { useRef, useState } from "react";

export default function NewIssue({ chinese = false }: { chinese?: boolean }) {
	const [open, setOpen] = useState(false);
	const [issues, setIssues] = useState<IssueDraft[]>([]);
	const opener = useRef<HTMLButtonElement>(null);
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const locale = chinese ? 0 : 1;

	return (
		<section
			aria-label={text("新建问题预览", "New issue preview")}
			className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6"
		>
			<Button type="button" ref={opener} shape="pill" onClick={() => setOpen(true)}>
				{text("新建问题", "New issue")}
			</Button>
			<p role="status" className="mt-4 text-sm text-muted-foreground">
				{text(
					`本次预览已创建 ${issues.length} 个问题`,
					`${issues.length} ${issues.length === 1 ? "issue" : "issues"} created in this preview`
				)}
			</p>
			{issues.length > 0 && (
				<ol
					aria-label={text("已创建的问题", "Created issues")}
					className="mt-3 divide-y divide-border"
				>
					{issues.map((issue, index) => (
						<li key={issues.length - index} className="space-y-1 py-3 text-sm">
							<p className="font-semibold wrap-anywhere">{issue.title}</p>
							<p className="text-xs text-muted-foreground">
								{issueLabels[issue.status][locale]} · {issueLabels[issue.priority][locale]}
							</p>
							{issue.description && (
								<p className="wrap-anywhere whitespace-pre-wrap">{issue.description}</p>
							)}
							{issue.attachments.length > 0 && (
								<p className="text-xs wrap-anywhere text-muted-foreground">
									{issue.attachments.map((file) => file.name).join(" · ")}
								</p>
							)}
						</li>
					))}
				</ol>
			)}
			<IssueComposer
				open={open}
				onOpenChange={setOpen}
				chinese={chinese}
				returnFocus={() => opener.current}
				onCreate={(issue) => setIssues((previous) => [issue, ...previous])}
			/>
		</section>
	);
}
