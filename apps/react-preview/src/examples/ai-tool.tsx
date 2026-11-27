import { Button } from "@valar/react-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/react-ui/code-block";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@valar/react-ui/item";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@valar/react-ui/sheet";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { useEffect, useRef, useState } from "react";

const manifest = JSON.stringify(
	{
		name: "sample-chat",
		private: true,
		scripts: { dev: "vite", check: "tsc --noEmit" },
		dependencies: { ai: "^7.0.0", "@ai-sdk/react": "^4.0.0" },
	},
	null,
	2
);
type Decision = "pending" | "running" | "approved" | "denied";

export default function ToolExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const [decision, setDecision] = useState<Decision>("pending");
	const status = useRef<HTMLDivElement>(null);
	const denyButton = useRef<HTMLButtonElement>(null);
	const [reset, setReset] = useState(0);
	useEffect(() => {
		if (decision !== "running") return;
		const timer = setTimeout(() => setDecision("approved"), 650);
		return () => clearTimeout(timer);
	}, [decision]);
	useEffect(() => {
		if (reset > 0) denyButton.current?.focus();
	}, [reset]);
	const calls = [
		{
			id: "node",
			title: text("Ran node --version", "已运行 node --version"),
			output: "v24.22.2",
			failed: false,
		},
		{
			id: "pnpm",
			title: text("Failed to run pnpm --version", "运行 pnpm --version 失败"),
			output: text("Command not found: pnpm", "找不到命令：pnpm"),
			failed: true,
		},
	];

	return (
		<section
			aria-label={text("Tool", "工具调用")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			<Trace>
				{calls.map(({ id, title, output, failed }) => (
					<TraceCollapsible key={id} defaultOpen={failed}>
						<TraceCollapsibleTrigger>
							<TraceLine status={failed ? "error" : undefined}>
								<TraceIcon>›_</TraceIcon>
								<TraceTitle>{title}</TraceTitle>
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent>
							<CodeBlock size="sm" variant={failed ? "destructive" : "default"}>
								<CodeBlockContent wrap code={output} />
							</CodeBlock>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				))}
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="sm" className="w-fit max-w-full justify-start px-0">
							<TraceLine>
								<TraceIcon>›_</TraceIcon>
								<TraceTitle>{text("Read package.json", "已读取 package.json")}</TraceTitle>
								<TraceIcon>›</TraceIcon>
							</TraceLine>
						</Button>
					</SheetTrigger>
					<SheetContent
						side="right"
						closeLabel={text("Close output", "关闭输出")}
						lang={chinese ? "zh-CN" : "en"}
					>
						<SheetHeader>
							<SheetTitle>package.json</SheetTitle>
							<SheetDescription>{text("Recorded file output", "记录的文件输出")}</SheetDescription>
						</SheetHeader>
						<CodeBlock className="mx-4 w-auto">
							<CodeBlockContent className="max-h-[60vh]" lineNumbers wrap code={manifest} />
						</CodeBlock>
					</SheetContent>
				</Sheet>
			</Trace>
			{decision === "pending" && (
				<Item variant="outline" size="sm">
					<ItemMedia variant="icon" aria-hidden="true">
						›_
					</ItemMedia>
					<ItemContent className="basis-40">
						<ItemTitle>{text("Run npm --version?", "运行 npm --version？")}</ItemTitle>
						<ItemDescription>
							{text("Returns sample output only.", "仅返回示例输出。")}
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Button
							ref={denyButton}
							size="sm"
							variant="outline"
							onClick={() => {
								setDecision("denied");
								status.current?.focus();
							}}
						>
							{text("Deny", "拒绝")}
						</Button>
						<Button
							size="sm"
							onClick={() => {
								setDecision("running");
								status.current?.focus();
							}}
						>
							{text("Approve", "批准")}
						</Button>
					</ItemActions>
				</Item>
			)}
			<div
				ref={status}
				tabIndex={-1}
				className="rounded-md focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			>
				{decision !== "pending" && (
					<Trace>
						{decision === "approved" ? (
							<TraceCollapsible defaultOpen>
								<TraceCollapsibleTrigger>
									<TraceLine>
										<TraceIcon>›_</TraceIcon>
										<TraceTitle>{text("Ran npm --version", "已运行 npm --version")}</TraceTitle>
									</TraceLine>
								</TraceCollapsibleTrigger>
								<TraceCollapsibleContent>
									<CodeBlock size="sm">
										<CodeBlockContent wrap code="11.6.2" />
									</CodeBlock>
								</TraceCollapsibleContent>
							</TraceCollapsible>
						) : (
							<TraceLine status={decision === "running" ? "running" : undefined}>
								<TraceIcon>›_</TraceIcon>
								<TraceTitle>
									{decision === "running"
										? text("Running npm --version", "正在运行 npm --version")
										: text("Denied npm --version", "已拒绝运行 npm --version")}
								</TraceTitle>
							</TraceLine>
						)}
					</Trace>
				)}
			</div>
			<span className="sr-only" role="status">
				{decision === "approved"
					? text("Fixture output is available.", "示例输出可用。")
					: decision === "denied"
						? text("Tool call denied.", "工具调用已拒绝。")
						: decision === "running"
							? text("Simulating tool output.", "正在模拟工具输出。")
							: ""}
			</span>
			{decision !== "pending" && (
				<Button
					className="justify-self-start"
					size="sm"
					variant="outline"
					onClick={() => {
						setDecision("pending");
						setReset(reset + 1);
					}}
				>
					{text("Reset approval", "重置审批")}
				</Button>
			)}
		</section>
	);
}
