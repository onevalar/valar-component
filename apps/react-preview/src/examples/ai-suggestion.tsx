import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Button } from "@valar/react-ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@valar/react-ui/input-group";
import { Message, MessageContent } from "@valar/react-ui/message";
import { useState } from "react";

const suggestions = [
	[
		"Add a dark mode toggle",
		"添加深色模式开关",
		"Added a theme toggle to the site header.",
		"已在网站页眉添加主题开关。",
	],
	[
		"Fix the failing build",
		"修复构建错误",
		"The build passed after restoring a missing import.",
		"补上缺失的导入后，构建已通过。",
	],
	[
		"Write tests for the form",
		"为表单编写测试",
		"Added tests for empty, invalid, and valid submissions.",
		"已添加空值、无效值和有效值的提交测试。",
	],
	[
		"Upgrade to Next.js 16",
		"升级到 Next.js 16",
		"Updated the two routes that needed asynchronous parameters.",
		"已更新两个需要异步参数的路由。",
	],
	[
		"Add a loading state",
		"添加加载状态",
		"Added a skeleton while the dashboard loads.",
		"已为仪表板添加加载骨架。",
	],
	[
		"Find unused dependencies",
		"查找未使用的依赖",
		"Found three packages that are not imported anywhere.",
		"发现了三个从未被导入的依赖。",
	],
];

export default function SuggestionExample({ chinese = false }: { chinese?: boolean }) {
	const t = (english: string, zh: string) => (chinese ? zh : english);
	const [text, setText] = useState("");
	const [turn, setTurn] = useState<{ prompt: string; index: number }>();
	const localized = suggestions.map(([en, zh, reply, replyZh]) => ({
		label: t(en, zh),
		reply: t(reply, replyZh),
	}));
	function send(prompt: string) {
		setTurn({ prompt, index: localized.findIndex(({ label }) => label === prompt) });
		setText("");
	}
	return (
		<section
			className="mx-auto grid w-full max-w-lg min-w-0 gap-4 px-4 py-6"
			aria-label={t("Prompt suggestions", "提示词建议")}
		>
			<div aria-live="polite" className="grid min-w-0 gap-3">
				{turn && (
					<>
						<Message align="end">
							<MessageContent>
								<Bubble align="end" variant="muted">
									<BubbleContent className="whitespace-pre-wrap">{turn.prompt}</BubbleContent>
								</Bubble>
							</MessageContent>
						</Message>
						<Message>
							<MessageContent>
								<p>
									{localized[turn.index]?.reply ??
										t(
											"This demo only knows the suggested prompts. Pick one to see a sample reply.",
											"此演示只识别建议的提示词。选择一项即可查看示例回复。"
										)}
								</p>
							</MessageContent>
						</Message>
					</>
				)}
			</div>
			<div
				role="group"
				aria-label={t("Suggested prompts", "建议的提示词")}
				className="flex min-w-0 [scrollbar-width:thin] gap-1.5 overflow-x-auto overscroll-x-contain pb-1"
			>
				{localized.map(({ label }, index) => (
					<Button
						key={index}
						variant="outline"
						size="sm"
						shape="pill"
						className="shrink-0"
						onClick={() => send(label)}
					>
						{label}
					</Button>
				))}
			</div>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					if (text.trim()) send(text.trim());
				}}
			>
				<InputGroup appearance="composer">
					<InputGroupTextarea
						name="message"
						value={text}
						rows={2}
						onChange={(event) => setText(event.target.value)}
						aria-label={t("Message", "消息")}
						placeholder={t("Ask the agent to change your code…", "请助手修改你的代码…")}
						onKeyDown={(event) => {
							if (
								event.key !== "Enter" ||
								event.shiftKey ||
								event.nativeEvent.isComposing ||
								event.keyCode === 229
							)
								return;
							event.preventDefault();
							event.currentTarget.form?.requestSubmit();
						}}
					/>
					<InputGroupAddon align="block-end">
						<InputGroupButton
							type="submit"
							size="icon-xs"
							shape="pill"
							variant="default"
							className="ms-auto"
							disabled={!text.trim()}
							aria-label={t("Send", "发送")}
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M8 13V3m-4 4 4-4 4 4" />
							</svg>
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			</form>
		</section>
	);
}
