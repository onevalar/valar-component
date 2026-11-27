"use client";

import { Button } from "@valar/react-ui/button";
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
import { useEffect, useState } from "react";

// Recorded fixture text only; replay never invokes a shell.
const commands = [
	{
		command: "pnpm test",
		lines: [
			"> vitest run",
			"✓ cart.test.ts (3 tests)",
			"✓ payment.test.ts (2 tests)",
			"Tests  5 passed",
		],
		exitCode: 0,
	},
	{
		command: "pnpm lint",
		lines: [
			"> eslint .",
			"src/cart.ts:14:7",
			"  'total' is assigned a value but never used.",
			"1 problem (1 error)",
		],
		exitCode: 1,
	},
];
const end = commands.reduce((total, command) => total + command.lines.length + 1, 0);

export default function TerminalExample({ chinese = false }: { chinese?: boolean }) {
	const [tick, setTick] = useState(end);
	const [hasReplayed, setHasReplayed] = useState(false);
	const [openByCommand, setOpenByCommand] = useState<Record<string, boolean>>({});
	const busy = tick < end;

	useEffect(() => {
		if (!busy) return;
		const timer = setInterval(() => setTick((current) => Math.min(current + 1, end)), 400);
		return () => clearInterval(timer);
	}, [busy]);
	function replay() {
		if (busy) return;
		setOpenByCommand({});
		setHasReplayed(true);
		setTick(0);
	}

	let start = 0;
	return (
		<section
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm"
		>
			<p className="text-muted-foreground">
				{chinese
					? "模拟终端输出，不执行命令。"
					: "Simulated terminal output. No commands are executed."}
			</p>
			<Trace>
				{commands.map(({ command, lines, exitCode }, index) => {
					const elapsed = tick - start;
					start += lines.length + 1;
					if (elapsed < 0) return null;
					const running = elapsed <= lines.length;
					const output = lines.slice(0, elapsed).join("\n");
					const failed = !running && exitCode !== 0;
					const title = running
						? chinese
							? `正在运行 ${command}`
							: `Running ${command}`
						: failed
							? chinese
								? `${command} 退出，退出码 ${exitCode}`
								: `${command} exited with code ${exitCode}`
							: chinese
								? `已运行 ${command}`
								: `Ran ${command}`;
					return (
						<TraceCollapsible
							key={command}
							open={
								openByCommand[command] ??
								(hasReplayed ? output !== "" : index === commands.length - 1)
							}
							onOpenChange={(open) =>
								setOpenByCommand((current) => ({ ...current, [command]: open }))
							}
						>
							<TraceCollapsibleTrigger>
								<TraceLine status={running ? "running" : failed ? "error" : undefined}>
									<TraceIcon className="font-mono">&gt;_</TraceIcon>
									<TraceTitle>{title}</TraceTitle>
								</TraceLine>
							</TraceCollapsibleTrigger>
							<TraceCollapsibleContent>
								<CodeBlock size="sm">
									<CodeBlockContent
										wrap
										className="max-h-64"
										code={output || (chinese ? "正在等待输出…" : "Waiting for output…")}
									/>
								</CodeBlock>
							</TraceCollapsibleContent>
						</TraceCollapsible>
					);
				})}
			</Trace>
			<Button
				variant="outline"
				size="sm"
				className="justify-self-start"
				aria-disabled={busy}
				onClick={replay}
			>
				{chinese ? "重播" : "Replay"}
			</Button>
			<span role="status" className="sr-only">
				{busy
					? chinese
						? "正在播放终端输出"
						: "Replaying terminal output"
					: chinese
						? "终端输出已完成"
						: "Terminal output complete"}
			</span>
		</section>
	);
}
