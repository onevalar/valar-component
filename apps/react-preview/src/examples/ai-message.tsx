import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Button } from "@valar/react-ui/button";
import {
	CodeBlock,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
} from "@valar/react-ui/code-block";
import { Message, MessageContent, MessageFooter } from "@valar/react-ui/message";
import { Textarea } from "@valar/react-ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@valar/react-ui/tooltip";
import { useEffect, useRef, useState } from "react";

const code = 'import { Dialog, DialogContent, DialogTrigger } from "@valar/react-ui/dialog";';
const icons = {
	copy: "M6 6h7v7H6zM4 11H3V3h8v1",
	check: "m3 8 3 3 7-7",
	edit: "m3 10 7-7 3 3-7 7H3zm6-6 3 3",
	good: "M5 7 7 3h2v4h4l-1 6H5zm-2 0h2v6H3z",
	bad: "m5 9 2 4h2V9h4l-1-6H5zM3 3h2v6H3z",
	retry: "M13 7a5 5 0 1 0-1.5 4.5M13 3v4H9",
};

export default function MessageExample({ chinese = false }: { chinese?: boolean }) {
	const t = (en: string, zh: string) => (chinese ? zh : en);
	const [edited, setEdited] = useState<string>();
	const question =
		edited ??
		t(
			"How do I add a settings dialog? It should open from the gear icon in the header.",
			"如何添加设置对话框？希望能从页眉的齿轮图标打开它。"
		);
	const intro = t(
		"Import Dialog, then open it from the gear button in the site header.",
		"导入 Dialog，再从网站页眉的齿轮按钮打开它。"
	);
	const guidance = t(
		"Wrap the gear button in DialogTrigger and put the form in DialogContent. Focus moves into the dialog on open. Press Escape to close it.",
		"用 DialogTrigger 包裹齿轮按钮，将表单放入 DialogContent。打开时焦点移入对话框，按 Escape 即可关闭。"
	);
	const [draft, setDraft] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
	const [copied, setCopied] = useState<"question" | "reply" | null>(null);
	const [status, setStatus] = useState<"copy-error" | "retried" | null>(null);
	const [retrying, setRetrying] = useState(false);
	const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const copyRequest = useRef(0);
	const editButton = useRef<HTMLButtonElement>(null);
	useEffect(
		() => () => {
			copyRequest.current++;
			clearTimeout(copyTimer.current);
			clearTimeout(retryTimer.current);
		},
		[]
	);

	async function copy(target: "question" | "reply") {
		const request = ++copyRequest.current;
		clearTimeout(copyTimer.current);
		setCopied(null);
		setStatus(null);
		try {
			await navigator.clipboard.writeText(
				target === "question" ? question : `${intro}\n\n${code}\n\n${guidance}`
			);
			if (request !== copyRequest.current) return;
			setCopied(target);
			copyTimer.current = setTimeout(() => setCopied(null), 2000);
		} catch {
			if (request === copyRequest.current) setStatus("copy-error");
		}
	}

	function retry() {
		if (retrying) return;
		setRetrying(true);
		setFeedback(null);
		setStatus(null);
		retryTimer.current = setTimeout(() => {
			setRetrying(false);
			setStatus("retried");
		}, 700);
	}

	function action(
		label: string,
		icon: keyof typeof icons,
		onClick: () => void,
		pressed?: boolean,
		disabled?: boolean
	) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						ref={icon === "edit" ? editButton : undefined}
						size="icon-xs"
						shape="pill"
						variant="ghost"
						className="text-muted-foreground aria-pressed:bg-accent aria-pressed:text-foreground"
						aria-label={label}
						aria-pressed={pressed}
						aria-disabled={disabled}
						onClick={onClick}
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.25"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d={icons[icon]} />
						</svg>
					</Button>
				</TooltipTrigger>
				<TooltipContent>{label}</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<section
			aria-label={t("Message example", "消息示例")}
			className="mx-auto grid w-full max-w-md min-w-0 gap-6 px-4 py-6 text-[15px]/6"
		>
			<TooltipProvider>
				<Message align="end">
					<MessageContent className="gap-2">
						{draft === null ? (
							<Bubble align="end" variant="muted">
								<BubbleContent className="whitespace-pre-wrap">{question}</BubbleContent>
							</Bubble>
						) : (
							<form
								className="grid min-w-0 gap-2"
								onSubmit={(event) => {
									event.preventDefault();
									if (!draft.trim()) return;
									setEdited(draft.trim());
									setDraft(null);
									editButton.current?.focus();
									retry();
								}}
								onKeyDown={(event) => {
									if (event.key === "Escape" && !event.nativeEvent.isComposing) {
										event.stopPropagation();
										setDraft(null);
										editButton.current?.focus();
									}
								}}
							>
								<Textarea
									autoFocus
									aria-label={t("Edit message", "编辑消息")}
									value={draft}
									onChange={(event) => setDraft(event.target.value)}
								/>
								<div className="flex justify-end gap-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => {
											setDraft(null);
											editButton.current?.focus();
										}}
									>
										{t("Cancel", "取消")}
									</Button>
									<Button type="submit" size="sm" disabled={!draft.trim()}>
										{t("Save", "保存")}
									</Button>
								</div>
							</form>
						)}
						<MessageFooter>
							{action(
								copied === "question"
									? t("Copied message", "消息已复制")
									: t("Copy message", "复制消息"),
								copied === "question" ? "check" : "copy",
								() => void copy("question")
							)}
							{action(t("Edit", "编辑"), "edit", () => setDraft(question))}
						</MessageFooter>
					</MessageContent>
				</Message>
				<Message>
					<MessageContent className="gap-3">
						<div className="grid min-w-0 gap-3" aria-busy={retrying}>
							{retrying ? (
								<p className="text-muted-foreground">
									{t("Regenerating the sample reply…", "正在重新生成示例回复…")}
								</p>
							) : (
								<>
									<p>{intro}</p>
									<CodeBlock size="sm">
										<CodeBlockActions>
											<CodeBlockCopyButton
												value={code}
												copyLabel={t("Copy code", "复制代码")}
												copiedLabel={t("Code copied", "代码已复制")}
											/>
										</CodeBlockActions>
										<CodeBlockContent wrap lineNumbers code={code} />
									</CodeBlock>
									<p>{guidance}</p>
								</>
							)}
						</div>
						<MessageFooter className="px-0">
							{!retrying && (
								<>
									{action(
										copied === "reply"
											? t("Copied reply", "回复已复制")
											: t("Copy reply", "复制回复"),
										copied === "reply" ? "check" : "copy",
										() => void copy("reply")
									)}
									{action(
										t("Good response", "回复有用"),
										"good",
										() => setFeedback(feedback === "good" ? null : "good"),
										feedback === "good"
									)}
									{action(
										t("Bad response", "回复无用"),
										"bad",
										() => setFeedback(feedback === "bad" ? null : "bad"),
										feedback === "bad"
									)}
								</>
							)}
							{action(t("Retry", "重试"), "retry", retry, undefined, retrying)}
						</MessageFooter>
					</MessageContent>
				</Message>
			</TooltipProvider>
			<p role="status" className="sr-only">
				{copied
					? t("Copied to clipboard", "已复制到剪贴板")
					: status === "copy-error"
						? t("Could not access the clipboard", "无法访问剪贴板")
						: status === "retried"
							? t("Sample reply regenerated", "已重新生成示例回复")
							: ""}
			</p>
		</section>
	);
}
