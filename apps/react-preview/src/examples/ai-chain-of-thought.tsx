import { Badge } from "@valar/react-ui/badge";
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
import { useRef, useState } from "react";

export default function ChainOfThoughtExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const [stage, setStage] = useState(3);
	const [summaryOpen, setSummaryOpen] = useState<boolean>();
	const advanceButton = useRef<HTMLButtonElement>(null);
	const running = stage < 3;
	const failed = stage === 4;

	return (
		<section
			aria-label={text("Chain of thought", "思维链")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			<Trace>
				<TraceCollapsible open={summaryOpen ?? running} onOpenChange={setSummaryOpen}>
					<TraceCollapsibleTrigger>
						<TraceLine status={running ? "running" : failed ? "error" : undefined}>
							<TraceIcon>{running ? "◌" : failed ? "!" : "✓"}</TraceIcon>
							<TraceTitle>
								{running
									? text("Researching", "正在调查")
									: failed
										? text("Researched in 3 steps, 1 failed", "调查共 3 步，1 步失败")
										: text("Researched in 3 steps", "已完成 3 步调查")}
							</TraceTitle>
						</TraceLine>
					</TraceCollapsibleTrigger>
					<TraceCollapsibleContent>
						<Trace>
							{stage === 0 ? (
								<TraceLine status="running">
									<TraceIcon>◌</TraceIcon>
									<TraceTitle>{text("Reading the build log", "正在读取构建日志")}</TraceTitle>
								</TraceLine>
							) : (
								<TraceCollapsible defaultOpen>
									<TraceCollapsibleTrigger>
										<TraceLine>
											<TraceIcon>✓</TraceIcon>
											<TraceTitle>{text("Read the build log", "已读取构建日志")}</TraceTitle>
										</TraceLine>
									</TraceCollapsibleTrigger>
									<TraceCollapsibleContent>
										<CodeBlock size="sm">
											<CodeBlockContent
												wrap
												code={text(
													"Install: 41s\nCompile: 38s\nImages: 3m 52s",
													"安装：41 秒\n编译：38 秒\n图片：3 分 52 秒"
												)}
											/>
										</CodeBlock>
									</TraceCollapsibleContent>
								</TraceCollapsible>
							)}
							{stage === 1 && (
								<TraceLine status="running">
									<TraceIcon>◌</TraceIcon>
									<TraceTitle>
										{text("Searching for image cache docs", "正在搜索图片缓存文档")}
									</TraceTitle>
								</TraceLine>
							)}
							{stage >= 2 && (
								<TraceCollapsible>
									<TraceCollapsibleTrigger>
										<TraceLine>
											<TraceIcon>✓</TraceIcon>
											<TraceTitle>
												{text("Found image cache docs", "已找到图片缓存文档")}
											</TraceTitle>
										</TraceLine>
									</TraceCollapsibleTrigger>
									<TraceCollapsibleContent className="flex flex-wrap gap-1.5">
										<Badge variant="secondary">nextjs.org</Badge>
										<Badge variant="secondary">vercel.com</Badge>
									</TraceCollapsibleContent>
								</TraceCollapsible>
							)}
							{stage === 2 && (
								<TraceLine status="running">
									<TraceIcon>◌</TraceIcon>
									<TraceTitle>{text("Searching for cacheKey", "正在搜索 cacheKey")}</TraceTitle>
								</TraceLine>
							)}
							{stage > 2 && (
								<TraceCollapsible>
									<TraceCollapsibleTrigger>
										<TraceLine status={failed ? "error" : undefined}>
											<TraceIcon>{failed ? "!" : "✓"}</TraceIcon>
											<TraceTitle>
												{failed
													? text("Failed to search for cacheKey", "搜索 cacheKey 失败")
													: text("Searched for cacheKey", "已搜索 cacheKey")}
											</TraceTitle>
										</TraceLine>
									</TraceCollapsibleTrigger>
									<TraceCollapsibleContent className="flex flex-wrap gap-1.5">
										{failed ? (
											<CodeBlock size="sm" variant="destructive">
												<CodeBlockContent
													wrap
													code={text(
														"The fixture search index was unavailable.",
														"示例搜索索引不可用。"
													)}
												/>
											</CodeBlock>
										) : (
											<>
												<Badge variant="secondary">next.config.ts</Badge>
												<Badge variant="secondary">scripts/optimize-images.ts</Badge>
											</>
										)}
									</TraceCollapsibleContent>
								</TraceCollapsible>
							)}
						</Trace>
					</TraceCollapsibleContent>
				</TraceCollapsible>
			</Trace>
			<p className="text-muted-foreground" role="status">
				{running
					? text("Replaying a recorded investigation.", "正在回放调查记录。")
					: failed
						? text(
								"The build log identified the slow phase, but the code search failed.",
								"构建日志找到了耗时阶段，但代码搜索失败。"
							)
						: text(
								"Image optimization is the slowest phase. Its cache key changes on every deploy.",
								"图片优化最耗时，其缓存键在每次部署时都会变化。"
							)}
			</p>
			<div className="flex flex-wrap gap-2">
				<Button
					ref={advanceButton}
					size="sm"
					variant="outline"
					onClick={() => {
						if (running) setStage(stage + 1);
						else {
							setSummaryOpen(undefined);
							setStage(0);
						}
					}}
				>
					{running ? text("Next step", "下一步") : text("Replay", "重播")}
				</Button>
				{stage === 2 && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							setStage(4);
							advanceButton.current?.focus();
						}}
					>
						{text("Show search failure", "显示搜索失败")}
					</Button>
				)}
			</div>
		</section>
	);
}
