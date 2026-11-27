import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Button } from "@valar/react-ui/button";
import { Marker, MarkerContent } from "@valar/react-ui/marker";
import { Message, MessageContent } from "@valar/react-ui/message";
import { Fragment, useLayoutEffect, useRef, useState } from "react";

export default function CheckpointExample({ chinese = false }: { chinese?: boolean } = {}) {
	const text = (en: string, zh: string) => (chinese ? zh : en);
	const thread = [
		{
			id: "rename",
			question: text("Rename the button component to Action.", "将按钮组件重命名为 Action。"),
			answer: text(
				"Renamed Button to Action in components/ui/button.tsx.",
				"已在 components/ui/button.tsx 中将 Button 重命名为 Action。"
			),
			checkpoint: text("Button renamed", "按钮已重命名"),
		},
		{
			id: "docs",
			question: text("Update the docs to match.", "同步更新文档。"),
			answer: text("Updated the Button page to say Action.", "已将 Button 文档页更新为 Action。"),
		},
	];
	const [visible, setVisible] = useState(thread.length);
	const interacted = useRef(false);
	const action = useRef<HTMLButtonElement>(null);
	useLayoutEffect(() => {
		if (interacted.current) action.current?.focus();
	}, [visible]);

	function changeThread(length: number) {
		interacted.current = true;
		setVisible(length);
	}

	return (
		<section
			aria-label={text("Checkpoint", "检查点")}
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-md gap-3 p-4 text-sm"
		>
			{thread.slice(0, visible).map(({ id, question, answer, checkpoint }, index) => (
				<Fragment key={id}>
					<Message align="end">
						<MessageContent>
							<Bubble align="end" variant="muted">
								<BubbleContent>{question}</BubbleContent>
							</Bubble>
						</MessageContent>
					</Message>
					<Message>
						<MessageContent>
							<p className="wrap-anywhere">{answer}</p>
						</MessageContent>
					</Message>
					{checkpoint && (
						<Marker variant="separator">
							<MarkerContent className="inline-flex flex-wrap items-center gap-2">
								{checkpoint}
								{index + 1 < visible && (
									<Button
										ref={action}
										size="xs"
										variant="outline"
										className="text-foreground"
										aria-label={text(`Restore to ${checkpoint}`, `恢复至：${checkpoint}`)}
										onClick={() => changeThread(index + 1)}
									>
										{text("Restore", "恢复")}
									</Button>
								)}
							</MarkerContent>
						</Marker>
					)}
				</Fragment>
			))}
			{visible < thread.length && (
				<Button
					ref={action}
					size="sm"
					variant="outline"
					className="justify-self-start"
					onClick={() => changeThread(visible + 1)}
				>
					{text("Continue", "继续")}
				</Button>
			)}
			<span className="sr-only" role="status">
				{visible < thread.length
					? text(
							"Restored the checkpoint. Later messages were removed.",
							"已恢复检查点并移除之后的消息。"
						)
					: ""}
			</span>
		</section>
	);
}
