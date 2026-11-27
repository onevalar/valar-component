import { Button } from "@valar/react-ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@valar/react-ui/item";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@valar/react-ui/trace";
import { useEffect, useRef, useState } from "react";

type Decision = "pending" | "running" | "approved" | "denied";

export default function ConfirmationExample({ chinese = false }: { chinese?: boolean } = {}) {
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

	function answer(approved: boolean) {
		setDecision(approved ? "running" : "denied");
		status.current?.focus();
	}

	return (
		<section
			aria-label={text("Confirmation", "确认")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			{decision === "pending" && (
				<Item variant="outline" size="sm">
					<ItemMedia variant="icon" aria-hidden="true">
						›_
					</ItemMedia>
					<ItemContent className="basis-40">
						<ItemTitle>{text("Remove the sample build folder?", "移除示例构建目录？")}</ItemTitle>
						<ItemDescription>
							{text("This is a preview. No files will change.", "此操作仅用于预览，不会改动文件。")}
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Button ref={denyButton} size="sm" variant="outline" onClick={() => answer(false)}>
							{text("Deny", "拒绝")}
						</Button>
						<Button size="sm" onClick={() => answer(true)}>
							{text("Approve", "批准")}
						</Button>
					</ItemActions>
				</Item>
			)}
			<div
				ref={status}
				role="status"
				tabIndex={-1}
				className="rounded-md focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			>
				{decision !== "pending" && (
					<Trace>
						<TraceLine status={decision === "running" ? "running" : undefined}>
							<TraceIcon>›_</TraceIcon>
							<TraceTitle>
								{decision === "running"
									? text("Simulating cleanup", "正在模拟清理")
									: decision === "approved"
										? text("Simulated cleanup completed", "模拟清理已完成")
										: text("Denied cleanup", "已拒绝清理")}
							</TraceTitle>
						</TraceLine>
					</Trace>
				)}
			</div>
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
					{text("Reset", "重置")}
				</Button>
			)}
		</section>
	);
}
