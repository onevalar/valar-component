import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Button } from "@valar/react-ui/button";
import { Message, MessageContent } from "@valar/react-ui/message";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleTrigger,
	TraceCollapsibleContent,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { useEffect, useState } from "react";

const tasks = [
	{
		title: ["Add a dark variant to the theme tokens", "为主题令牌添加深色变体"],
		detail: [
			"Set surface, border, and text values for both modes.",
			"为浅色和深色模式分别设置表面、边框和文字颜色。",
		],
	},
	{ title: ["Read the theme from a cookie", "从 Cookie 读取主题"] },
	{ title: ["Add a toggle to the settings page", "在设置页添加开关"] },
	{
		title: ["Check contrast on the charts", "检查图表对比度"],
		detail: [
			"Verify chart labels and series in both modes.",
			"在两种模式下验证图表标签和数据系列。",
		],
	},
];

export default function QueueExample({ chinese = false }: { chinese?: boolean }) {
	const t = (english: string, zh: string) => (chinese ? zh : english);
	const locale = chinese ? 1 : 0;
	const [completed, setCompleted] = useState(tasks.length);
	const running = completed < tasks.length;
	useEffect(() => {
		if (completed === tasks.length) return;
		const timer = setTimeout(() => setCompleted(completed + 1), 1400);
		return () => clearTimeout(timer);
	}, [completed]);
	const sections = [
		{
			done: false,
			label: t(`${tasks.length - completed} to do`, `${tasks.length - completed} 项待办`),
		},
		{ done: true, label: t(`${completed} completed`, `${completed} 项已完成`) },
	];
	return (
		<section
			aria-label={t("Agent queue", "助手任务队列")}
			className="mx-auto flex w-full max-w-md min-w-0 flex-col gap-4 px-4 py-6 text-sm"
		>
			<Message align="end">
				<MessageContent>
					<Bubble align="end" variant="muted">
						<BubbleContent>
							{t("Add dark mode to the settings page.", "为设置页面添加深色模式。")}
						</BubbleContent>
					</Bubble>
				</MessageContent>
			</Message>
			<Message>
				<MessageContent className="gap-3">
					<Trace>
						{sections.map(({ done, label }) => (
							<TraceCollapsible key={String(done)} defaultOpen>
								<TraceCollapsibleTrigger>
									<TraceLine>
										<TraceIcon>{done ? "✓" : "≡"}</TraceIcon>
										<TraceTitle>{label}</TraceTitle>
									</TraceLine>
								</TraceCollapsibleTrigger>
								<TraceCollapsibleContent>
									<Trace>
										{tasks.map(({ title, detail }, index) => {
											if (index < completed !== done) return null;
											const active = index === completed;
											const line = (
												<TraceLine status={active ? "running" : undefined}>
													<TraceIcon>
														<svg
															viewBox="0 0 16 16"
															fill="none"
															stroke="currentColor"
															strokeWidth="1.25"
														>
															<circle cx="8" cy="8" r="6" />
															{done ? (
																<path d="m5 8 2 2 4-4" />
															) : (
																active && (
																	<circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
																)
															)}
														</svg>
													</TraceIcon>
													<TraceTitle className="whitespace-normal">
														{title[locale]}
														{active && (
															<span className="sr-only"> · {t("In progress", "进行中")}</span>
														)}
													</TraceTitle>
												</TraceLine>
											);
											return detail ? (
												<TraceCollapsible key={index}>
													<TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
													<TraceCollapsibleContent>{detail[locale]}</TraceCollapsibleContent>
												</TraceCollapsible>
											) : (
												<div key={index}>{line}</div>
											);
										})}
										{(done ? completed === 0 : !running) && (
											<p className="text-xs text-muted-foreground">
												{done
													? t("Nothing completed yet.", "尚无已完成的任务。")
													: t("No remaining tasks.", "没有剩余任务。")}
											</p>
										)}
									</Trace>
								</TraceCollapsibleContent>
							</TraceCollapsible>
						))}
					</Trace>
					<p role="status">
						{running
							? t(
									`${completed} of ${tasks.length} tasks completed.`,
									`已完成 ${completed}/${tasks.length} 项任务。`
								)
							: t(
									"Dark mode is in. The toggle is under Settings → Appearance.",
									"已添加深色模式。开关位于「设置 → 外观」。"
								)}
					</p>
				</MessageContent>
			</Message>
			<Button
				variant="outline"
				size="sm"
				className="self-start"
				aria-disabled={running}
				onClick={() => {
					if (!running) setCompleted(0);
				}}
			>
				{running ? t("Replaying…", "正在重播…") : t("Replay", "重播")}
			</Button>
		</section>
	);
}
