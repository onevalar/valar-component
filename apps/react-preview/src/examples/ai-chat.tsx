import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentTitle,
} from "@valar/react-ui/attachment";
import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Button } from "@valar/react-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/react-ui/code-block";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@valar/react-ui/input-group";
import { Message, MessageContent } from "@valar/react-ui/message";
import { MessageScroller } from "@valar/react-ui/message-scroller";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { Fragment, useEffect, useRef, useState } from "react";

const script = [
	{
		prompt: ["Add a dark mode toggle to the settings page.", "为设置页面添加深色模式开关。"],
		thought: [
			"First check how themes are configured in the sample project.",
			"先检查示例项目中的主题配置。",
		],
		result: "src/routes/+layout.svelte\nModeWatcher is already configured.",
		reply: [
			[
				"The sample project already has a theme provider, so the toggle only needs to change the active mode.",
				"示例项目已经配置了主题提供器，开关只需切换当前模式。",
			],
			[
				"The new ModeToggle lives next to the Appearance heading and offers Light and Dark options.",
				"新的 ModeToggle 位于「外观」标题旁，提供浅色和深色选项。",
			],
			[
				"The selected mode is saved so the setting survives a page refresh.",
				"所选模式会保存，刷新页面后仍然有效。",
			],
		],
	},
	{
		prompt: ["Make it follow the system setting by default.", "默认跟随系统设置。"],
		thought: [
			"Look at the theme provider's default mode in the sample.",
			"查看示例中主题提供器的默认模式。",
		],
		result: '<ModeWatcher defaultMode="system" />',
		reply: [
			[
				"New visitors now get the theme from their operating system.",
				"新访客现在会使用操作系统的主题。",
			],
			[
				"The toggle includes a System option, so anyone who picked Light or Dark can switch back.",
				"开关新增了「系统」选项，选择过浅色或深色的用户可以切换回来。",
			],
			[
				"Explicit choices still take precedence over system changes.",
				"用户明确选择的模式仍优先于系统变化。",
			],
		],
	},
	{
		prompt: ["Run the build before I ship it.", "发布前运行构建。"],
		thought: [
			"Review the sample build output for compilation and prerender errors.",
			"检查示例构建输出中的编译与预渲染错误。",
		],
		result: "✓ Built in 4.2s\n✓ Prerendered 12 pages",
		reply: [
			["In the sample output, the build passes.", "示例输出显示构建通过。"],
			[
				"Compilation finished in 4.2 seconds, and all 12 static pages were generated.",
				"编译耗时 4.2 秒，全部 12 个静态页面已生成。",
			],
			["The theme change is ready for review.", "主题修改可提交审核。"],
		],
	},
];

type LocalFile = { id: number; file: File };
type Turn = {
	id: number;
	prompt: string;
	scenario: number;
	files: LocalFile[];
	step: number;
	stopped: boolean;
};
const finalStep = 5;

export default function ChatExample({ chinese = false }: { chinese?: boolean }) {
	const t = (en: string, zh: string) => (chinese ? zh : en);
	const locale = chinese ? 1 : 0;
	const [turns, setTurns] = useState<Turn[]>([]);
	const [draft, setDraft] = useState<string | null>(null);
	const [files, setFiles] = useState<LocalFile[]>([]);
	const nextId = useRef(0);
	const picker = useRef<HTMLInputElement>(null);
	const textarea = useRef<HTMLTextAreaElement>(null);
	const latest = turns.at(-1);
	const busy = !!latest && latest.step < finalStep && !latest.stopped;
	const step = latest?.step;
	const latestId = latest?.id;
	const nextScenario = turns.filter((turn) => turn.scenario >= 0).length;
	const suggested = script[nextScenario]?.prompt[locale] ?? "";
	const text = draft ?? (busy ? "" : suggested);
	useEffect(() => {
		if (!busy) return;
		const timer = setTimeout(() => {
			setTurns((current) =>
				current.map((turn) =>
					turn.id === latestId && !turn.stopped ? { ...turn, step: turn.step + 1 } : turn
				)
			);
		}, 480);
		return () => clearTimeout(timer);
	}, [busy, latestId, step]);

	function send() {
		const prompt = text.trim();
		if (busy || (!prompt && files.length === 0)) return;
		const id = ++nextId.current;
		setTurns((current) => [
			...current,
			{
				id,
				prompt,
				scenario: prompt && prompt === suggested ? nextScenario : -1,
				files,
				step: 0,
				stopped: false,
			},
		]);
		setDraft(null);
		setFiles([]);
		textarea.current?.focus();
	}

	return (
		<section
			aria-label={t("Chat example", "对话示例")}
			className="mx-auto flex h-[min(36rem,90dvh)] min-h-88 w-full max-w-2xl flex-col overflow-hidden rounded-xl border-[0.5px] border-border bg-background text-sm"
		>
			<header className="flex shrink-0 items-center justify-between gap-3 border-b-[0.5px] border-border px-4 py-2.5 sm:px-6">
				<div>
					<h2 className="font-medium">{t("New Thread", "新对话")}</h2>
					<p className="text-xs text-muted-foreground">
						{t("A scripted chat, running locally.", "在本地运行的脚本对话。")}
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					disabled={busy || (!turns.length && draft === null && !files.length)}
					onClick={() => {
						setTurns([]);
						setDraft(null);
						setFiles([]);
						textarea.current?.focus();
					}}
				>
					{t("Reset conversation", "重置对话")}
				</Button>
			</header>
			<div className="min-h-0 flex-1">
				{!turns.length ? (
					<div className="grid h-full place-content-center gap-1 p-4 text-center">
						<h3 className="text-base font-medium">
							{t("What should we build?", "我们要构建什么？")}
						</h3>
						<p className="text-muted-foreground">
							{t(
								"Send the sample prompt to see the reply stream.",
								"发送示例提示词，查看流式回复。"
							)}
						</p>
					</div>
				) : (
					<MessageScroller.Provider autoScroll defaultScrollPosition="last-anchor">
						<MessageScroller.Root>
							<MessageScroller.Viewport aria-label={t("Transcript", "对话记录")}>
								<MessageScroller.Content aria-busy={busy} className="gap-4 px-4 py-4 sm:px-6">
									{turns.map((turn) => {
										const scenario = script[turn.scenario];
										const running = !turn.stopped && turn.step < finalStep;
										return (
											<Fragment key={turn.id}>
												<MessageScroller.Item messageId={`question-${turn.id}`} scrollAnchor>
													<Message align="end">
														<MessageContent>
															<Bubble align="end" variant="muted">
																<BubbleContent className="whitespace-pre-wrap">
																	{turn.prompt}
																	{turn.files.length > 0 && (
																		<p className="text-xs wrap-anywhere text-muted-foreground">
																			{t("Attachments", "附件")}:{" "}
																			{turn.files.map(({ file }) => file.name).join(", ")}
																		</p>
																	)}
																</BubbleContent>
															</Bubble>
														</MessageContent>
													</Message>
												</MessageScroller.Item>
												<MessageScroller.Item messageId={`reply-${turn.id}`}>
													<Message>
														<MessageContent className="gap-2 text-[15px]/6">
															{scenario && (
																<Trace>
																	<TraceCollapsible>
																		<TraceCollapsibleTrigger>
																			<TraceLine
																				status={running && turn.step === 0 ? "running" : undefined}
																			>
																				<TraceTitle>{t("Work summary", "工作摘要")}</TraceTitle>
																			</TraceLine>
																		</TraceCollapsibleTrigger>
																		<TraceCollapsibleContent>
																			{scenario.thought[locale]}
																		</TraceCollapsibleContent>
																	</TraceCollapsible>
																	{turn.step >= 2 ? (
																		<TraceCollapsible>
																			<TraceCollapsibleTrigger>
																				<TraceLine>
																					<TraceTitle>
																						{t("Sample tool output", "示例工具输出")}
																					</TraceTitle>
																				</TraceLine>
																			</TraceCollapsibleTrigger>
																			<TraceCollapsibleContent>
																				<CodeBlock size="sm">
																					<CodeBlockContent wrap code={scenario.result} />
																				</CodeBlock>
																			</TraceCollapsibleContent>
																		</TraceCollapsible>
																	) : (
																		turn.step === 1 &&
																		running && (
																			<TraceLine status="running">
																				<TraceTitle>
																					{t("Checking sample output…", "正在检查示例输出…")}
																				</TraceTitle>
																			</TraceLine>
																		)
																	)}
																</Trace>
															)}
															{scenario?.reply
																.slice(0, Math.max(0, turn.step - 2))
																.map((paragraph, index) => (
																	<p key={index}>{paragraph[locale]}</p>
																))}
															{!scenario && !running && !turn.stopped && (
																<p>
																	{t(
																		"This demo only knows the scripted turns. Send the suggested prompt or reset to start over.",
																		"此演示只识别预设对话。请发送建议的提示词，或重置后重新开始。"
																	)}
																</p>
															)}
															{running && turn.step < 3 && (
																<p className="text-sm text-muted-foreground">
																	{t("Thinking…", "正在思考…")}
																</p>
															)}
															{turn.stopped && (
																<p className="text-sm text-muted-foreground">
																	{t("Reply stopped.", "回复已停止。")}
																</p>
															)}
														</MessageContent>
													</Message>
												</MessageScroller.Item>
											</Fragment>
										);
									})}
								</MessageScroller.Content>
							</MessageScroller.Viewport>
							<MessageScroller.Button label={t("Jump to latest", "跳到最新消息")} />
						</MessageScroller.Root>
					</MessageScroller.Provider>
				)}
			</div>
			<p role="status" className="sr-only">
				{busy
					? t("Generating a reply", "正在生成回复")
					: latest?.stopped
						? t("Reply stopped", "回复已停止")
						: latest
							? t("Reply complete", "回复已完成")
							: ""}
			</p>
			<form
				className="shrink-0 px-4 pt-2 pb-4 sm:px-6"
				onSubmit={(event) => {
					event.preventDefault();
					send();
				}}
			>
				<input
					ref={picker}
					type="file"
					multiple
					hidden
					onChange={(event) => {
						const selected = Array.from(event.currentTarget.files ?? [], (file) => ({
							id: ++nextId.current,
							file,
						}));
						setFiles((current) => [...current, ...selected]);
						event.currentTarget.value = "";
					}}
				/>
				<InputGroup appearance="composer">
					{files.length > 0 && (
						<InputGroupAddon
							align="block-start"
							className="max-h-24 flex-wrap gap-1.5 overflow-y-auto"
							aria-label={t("Attachments", "附件")}
						>
							{files.map(({ id, file }) => (
								<Attachment key={id} size="sm" className="max-w-full min-w-0">
									<AttachmentContent>
										<AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
									</AttachmentContent>
									<AttachmentActions>
										<AttachmentAction
											aria-label={`${t("Remove", "移除")} ${file.name}`}
											onClick={() => {
												setFiles((current) => current.filter((item) => item.id !== id));
												textarea.current?.focus();
											}}
										>
											<span aria-hidden="true">×</span>
										</AttachmentAction>
									</AttachmentActions>
								</Attachment>
							))}
						</InputGroupAddon>
					)}
					<InputGroupTextarea
						ref={textarea}
						name="message"
						rows={2}
						className="max-h-28"
						value={text}
						readOnly={busy}
						aria-label={t("Message", "消息")}
						placeholder={t("Ask the agent…", "向助手提问…")}
						onChange={(event) => setDraft(event.target.value)}
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
					<InputGroupAddon align="block-end" className="justify-end gap-2">
						<InputGroupButton
							size="icon-xs"
							shape="pill"
							disabled={busy}
							aria-label={t("Attach files", "添加文件")}
							onClick={() => picker.current?.click()}
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							>
								<path d="M8 3v10M3 8h10" />
							</svg>
						</InputGroupButton>
						{busy ? (
							<InputGroupButton
								key="stop"
								size="icon-xs"
								variant="default"
								shape="pill"
								aria-label={t("Stop reply", "停止回复")}
								onClick={() => {
									setTurns((current) =>
										current.map((turn) =>
											turn.id === latestId ? { ...turn, stopped: true } : turn
										)
									);
									textarea.current?.focus();
								}}
							>
								<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
									<rect x="4" y="4" width="8" height="8" rx="1" />
								</svg>
							</InputGroupButton>
						) : (
							<InputGroupButton
								key="send"
								type="submit"
								size="icon-xs"
								variant="default"
								shape="pill"
								disabled={!text.trim() && !files.length}
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
						)}
					</InputGroupAddon>
				</InputGroup>
			</form>
		</section>
	);
}
