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

export default function ReasoningExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const [phase, setPhase] = useState(2);
	const [open, setOpen] = useState<boolean>();
	const done = phase === 2;
	const observation = text(
		"Installing and compiling each take less than one minute.",
		"安装与编译各耗时不到一分钟。"
	);
	const conclusion = text(
		"Image optimization takes nearly four minutes because every deploy misses the cache.",
		"每次部署都未命中缓存，图片优化耗时接近四分钟。"
	);

	return (
		<section
			aria-label={text("Reasoning", "推理")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			<Trace>
				{phase === 0 ? (
					<TraceLine status="running">
						<TraceIcon>◌</TraceIcon>
						<TraceTitle>{text("Thinking", "正在思考")}</TraceTitle>
					</TraceLine>
				) : (
					<TraceCollapsible open={open ?? !done} onOpenChange={setOpen}>
						<TraceCollapsibleTrigger>
							<TraceLine status={done ? undefined : "running"}>
								<TraceIcon>{done ? "✓" : "◌"}</TraceIcon>
								<TraceTitle>
									{done ? text("Thought", "已完成思考") : text("Thinking", "正在思考")}
								</TraceTitle>
								{done && <TraceDescription>{text("12s", "12 秒")}</TraceDescription>}
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent className="whitespace-pre-wrap">
							{done ? `${observation}\n\n${conclusion}` : observation}
						</TraceCollapsibleContent>
					</TraceCollapsible>
				)}
			</Trace>
			<p role="status" className="text-muted-foreground">
				{done
					? text("Image optimization is the bottleneck.", "图片优化是部署瓶颈。")
					: text("Replaying a recorded reasoning summary.", "正在回放推理摘要。")}
			</p>
			<Button
				className="justify-self-start"
				size="sm"
				variant="outline"
				onClick={() => {
					if (done) {
						setOpen(undefined);
						setPhase(0);
					} else setPhase(phase + 1);
				}}
			>
				{done ? text("Replay", "重播") : text("Next step", "下一步")}
			</Button>
		</section>
	);
}
