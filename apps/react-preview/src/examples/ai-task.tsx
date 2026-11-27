import { Button } from "@valar/react-ui/button";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { useState } from "react";

export default function TaskExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const [stage, setStage] = useState(0);
	const [open, setOpen] = useState<boolean>();
	const running = stage < 2;
	const title = running
		? text("Updating the page metadata", "正在更新页面元数据")
		: text("Failed to update the page metadata", "更新页面元数据失败");

	return (
		<section
			aria-label={text("Task", "任务")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			<Trace>
				<TraceCollapsible>
					<TraceCollapsibleTrigger>
						<TraceLine>
							<TraceIcon>✓</TraceIcon>
							<TraceTitle>{text("Found the project files", "已找到项目文件")}</TraceTitle>
						</TraceLine>
					</TraceCollapsibleTrigger>
					<TraceCollapsibleContent>
						<Trace>
							<TraceLine>
								<TraceTitle>
									{text("Searched for generateMetadata", "已搜索 generateMetadata")}
								</TraceTitle>
							</TraceLine>
							<TraceLine>
								<TraceTitle>{text("Read app/layout.tsx", "已读取 app/layout.tsx")}</TraceTitle>
							</TraceLine>
						</Trace>
					</TraceCollapsibleContent>
				</TraceCollapsible>
				<TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
					<TraceCollapsibleTrigger>
						<TraceLine status={running ? "running" : "error"}>
							<TraceIcon>{running ? "◌" : "!"}</TraceIcon>
							<TraceTitle>{title}</TraceTitle>
						</TraceLine>
					</TraceCollapsibleTrigger>
					<TraceCollapsibleContent>
						<Trace>
							<TraceLine status={stage === 0 ? "running" : undefined}>
								<TraceIcon>{stage === 0 ? "◌" : "✓"}</TraceIcon>
								<TraceTitle>
									{stage === 0
										? text("Editing app/layout.tsx", "正在编辑 app/layout.tsx")
										: text("Edited app/layout.tsx", "已编辑 app/layout.tsx")}
								</TraceTitle>
							</TraceLine>
							{stage > 0 && (
								<TraceLine status={running ? "running" : "error"}>
									<TraceIcon>{running ? "◌" : "!"}</TraceIcon>
									<TraceTitle>
										{running
											? text("Editing app/page.tsx", "正在编辑 app/page.tsx")
											: text("Could not edit app/page.tsx", "无法编辑 app/page.tsx")}
									</TraceTitle>
								</TraceLine>
							)}
						</Trace>
					</TraceCollapsibleContent>
				</TraceCollapsible>
			</Trace>
			<p className="text-muted-foreground" role="status">
				{running
					? text("The next step appears only after it starts.", "步骤开始后才会显示。")
					: text(
							"The sample page was read-only. No files were changed.",
							"示例页面为只读，未修改任何文件。"
						)}
			</p>
			<Button
				className="justify-self-start"
				size="sm"
				variant="outline"
				onClick={() => {
					if (running) setStage(stage + 1);
					else {
						setOpen(undefined);
						setStage(0);
					}
				}}
			>
				{running ? text("Next step", "下一步") : text("Replay", "重播")}
			</Button>
		</section>
	);
}
