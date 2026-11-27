import { Button } from "@valar/react-ui/button";
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

export default function PlanExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const [done, setDone] = useState(1);
	const steps = [
		text("Add dark theme tokens", "添加深色主题令牌"),
		text("Read the saved theme on the server", "在服务器读取已保存的主题"),
		text("Add a toggle to Settings", "在设置中添加切换开关"),
		text("Check contrast on the charts", "检查图表对比度"),
	];
	const complete = done === steps.length;

	return (
		<section
			aria-label={text("Plan", "计划")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			<Trace>
				<TraceCollapsible defaultOpen>
					<TraceCollapsibleTrigger>
						<TraceLine status={complete ? undefined : "running"}>
							<TraceIcon>{complete ? "✓" : "↳"}</TraceIcon>
							<TraceTitle className="whitespace-normal">
								{text("Plan: add dark mode", "计划：添加深色模式")}
							</TraceTitle>
							<TraceDescription>
								{text(`${done} of ${steps.length} done`, `已完成 ${done}/${steps.length} 步`)}
							</TraceDescription>
						</TraceLine>
					</TraceCollapsibleTrigger>
					<TraceCollapsibleContent className="grid gap-2">
						<p>
							{text(
								"Save the theme in a cookie so the page renders in the right colors on load.",
								"将主题保存在 Cookie 中，让页面初次加载时就显示正确的配色。"
							)}
						</p>
						<Trace role="list">
							{steps.map((step, index) => (
								<TraceLine
									key={index}
									role="listitem"
									status={index === done ? "running" : index > done ? "pending" : undefined}
								>
									<TraceIcon>{index < done ? "✓" : index === done ? "◉" : "○"}</TraceIcon>
									<TraceTitle className="whitespace-normal">
										{step}
										<span className="sr-only">
											{" "}
											—{" "}
											{index < done
												? text("Done", "已完成")
												: index === done
													? text("In progress", "进行中")
													: text("Pending", "待处理")}
										</span>
									</TraceTitle>
								</TraceLine>
							))}
						</Trace>
					</TraceCollapsibleContent>
				</TraceCollapsible>
			</Trace>
			<span className="sr-only" role="status">
				{text(`${done} of ${steps.length} done`, `已完成 ${done}/${steps.length} 步`)}
			</span>
			<Button
				className="justify-self-start"
				size="sm"
				variant="outline"
				onClick={() => setDone(complete ? 0 : done + 1)}
			>
				{complete ? text("Replay", "重播") : text("Complete next step", "完成当前步骤")}
			</Button>
		</section>
	);
}
