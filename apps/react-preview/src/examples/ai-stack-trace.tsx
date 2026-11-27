"use client";

import { CodeBlock, CodeBlockContent } from "@valar/react-ui/code-block";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { useId } from "react";

const stack = `TypeError: Cannot read properties of undefined (reading 'total')
  at formatInvoice (src/billing.ts:42:31)
  at InvoiceRow (src/invoice-row.tsx:18:12)
  at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
  at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)
  at process.processTicksAndRejections (node:internal/process/task_queues:105:5)`;
const [error, ...frames] = stack.split("\n").map((line) => line.trim());
const isInternal = (frame: string) => frame.includes("node_modules/") || frame.includes("node:");
const internalFrames = frames.filter(isInternal);
const appFrames = frames.filter((frame) => !isInternal(frame));
const snippets = ["return formatMoney(invoice.total);", "const total = formatInvoice(invoice);"];

export default function StackTraceExample({ chinese = false }: { chinese?: boolean }) {
	const frameId = useId();
	return (
		<section lang={chinese ? "zh-CN" : "en"} className="w-full max-w-sm min-w-0 p-4">
			<Trace>
				<TraceCollapsible defaultOpen>
					<TraceCollapsibleTrigger>
						<TraceLine status="error">
							<TraceIcon>×</TraceIcon>
							<TraceTitle>{chinese ? `失败：${error}` : `Failed: ${error}`}</TraceTitle>
						</TraceLine>
					</TraceCollapsibleTrigger>
					<TraceCollapsibleContent className="grid gap-2">
						<p className="font-mono text-xs text-destructive">{error}</p>
						<Trace>
							{appFrames.map((frame, index) => (
								<a
									key={frame}
									href={`#${frameId}-frame-${index}`}
									className="rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
								>
									<TraceLine>
										<TraceIcon>↳</TraceIcon>
										<TraceTitle>{frame}</TraceTitle>
									</TraceLine>
								</a>
							))}
							<TraceCollapsible>
								<TraceCollapsibleTrigger>
									<TraceLine>
										<TraceIcon>≡</TraceIcon>
										<TraceTitle>
											{chinese
												? `${internalFrames.length} 个框架堆栈帧`
												: `${internalFrames.length} framework frames`}
										</TraceTitle>
									</TraceLine>
								</TraceCollapsibleTrigger>
								<TraceCollapsibleContent>
									<CodeBlock size="sm">
										<CodeBlockContent wrap code={internalFrames.join("\n")} />
									</CodeBlock>
								</TraceCollapsibleContent>
							</TraceCollapsible>
						</Trace>
						<ol
							aria-label={chinese ? "示例源代码" : "Sample source lines"}
							className="grid gap-1 rounded-lg border-[0.5px] border-border bg-muted p-2 font-mono text-xs text-foreground"
						>
							{appFrames.map((frame, index) => (
								<li
									key={frame}
									id={`${frameId}-frame-${index}`}
									tabIndex={-1}
									className="rounded-sm p-1 target:bg-accent target:outline-1 target:-outline-offset-1 target:outline-ring"
								>
									<div className="text-muted-foreground">{frame.match(/\(([^)]+)\)$/)?.[1]}</div>
									<code>{snippets[index]}</code>
								</li>
							))}
						</ol>
					</TraceCollapsibleContent>
				</TraceCollapsible>
			</Trace>
		</section>
	);
}
