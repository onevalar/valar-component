import { Badge } from "@valar/react-ui/badge";
import { Button } from "@valar/react-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/react-ui/code-block";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceDescription,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { useState } from "react";

export default function SubagentExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const [stage, setStage] = useState(2);
	const done = stage === 2;
	const title = done
		? text("Ran the research subagent", "研究子代理已完成")
		: text("Running the research subagent", "研究子代理正在运行");
	const steps = [
		{
			command: "grep -rn cacheKey scripts",
			output: "scripts/optimize-images.ts:14: const cacheKey = process.env.COMMIT_SHA",
		},
		{
			command: "sed -n 13,15p scripts/optimize-images.ts",
			output:
				'const cacheDir = ".next/cache/images"\nconst cacheKey = process.env.COMMIT_SHA\nconst cached = await restoreCache(cacheDir, cacheKey)',
		},
	];

	return (
		<section
			aria-label={text("Subagent", "子代理")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			<Trace>
				{stage === 0 ? (
					<TraceLine status="running">
						<TraceIcon>◌</TraceIcon>
						<TraceTitle>{title}</TraceTitle>
					</TraceLine>
				) : (
					<TraceCollapsible defaultOpen>
						<TraceCollapsibleTrigger>
							<TraceLine status={done ? undefined : "running"}>
								<TraceIcon>{done ? "✓" : "◌"}</TraceIcon>
								<TraceTitle>{title}</TraceTitle>
								{done && <TraceDescription>{text("48s", "48 秒")}</TraceDescription>}
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent className="grid gap-2">
							<div className="flex flex-wrap gap-1.5">
								<Badge variant="secondary">
									{text("Research model (fixture)", "研究模型（示例）")}
								</Badge>
								<Badge variant="outline">runCommand</Badge>
							</div>
							<p>
								{text(
									"Find out why image optimization reruns on every deploy.",
									"查明为什么每次部署都会重新优化图片。"
								)}
							</p>
							<Trace>
								{steps.map(({ command, output }, index) =>
									index >= stage ? (
										<TraceLine key={command} status="running">
											<TraceIcon>◌</TraceIcon>
											<TraceTitle className="wrap-anywhere whitespace-normal">
												{text(`Running ${command}`, `正在运行 ${command}`)}
											</TraceTitle>
										</TraceLine>
									) : (
										<TraceCollapsible key={command}>
											<TraceCollapsibleTrigger>
												<TraceLine>
													<TraceIcon>✓</TraceIcon>
													<TraceTitle className="wrap-anywhere whitespace-normal">
														{text(`Ran ${command}`, `已运行 ${command}`)}
													</TraceTitle>
												</TraceLine>
											</TraceCollapsibleTrigger>
											<TraceCollapsibleContent>
												<CodeBlock size="sm">
													<CodeBlockContent wrap code={output} />
												</CodeBlock>
											</TraceCollapsibleContent>
										</TraceCollapsible>
									)
								)}
							</Trace>
							{done && (
								<p>
									{text(
										"The cache key uses the commit SHA, so every deployment misses the cache.",
										"缓存键使用提交 SHA，因此每次部署都未命中缓存。"
									)}
								</p>
							)}
						</TraceCollapsibleContent>
					</TraceCollapsible>
				)}
			</Trace>
			<span className="sr-only" role="status">
				{title}
			</span>
			<Button
				className="justify-self-start"
				size="sm"
				variant="outline"
				onClick={() => setStage(done ? 0 : stage + 1)}
			>
				{done ? text("Replay", "重播") : text("Next step", "下一步")}
			</Button>
		</section>
	);
}
