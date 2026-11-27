import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentMedia,
	AttachmentTitle,
} from "@valar/react-ui/attachment";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupHeading,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@valar/react-ui/input-group";
import { useRef, useState } from "react";

const models = [
	{ name: "OpenAI", items: ["GPT-5", "GPT-5 mini"] },
	{ name: "Anthropic", items: ["Claude Sonnet 4.5", "Claude Haiku 4.5"] },
];
const efforts = ["Low", "Medium", "High"];
type AttachmentFile = { id: number; file: File };
type Submission = { text: string; files: AttachmentFile[]; model: string; effort: string };

export default function PromptInputExample({ chinese = false }: { chinese?: boolean }) {
	const t = (english: string, zh: string) => (chinese ? zh : english);
	const [text, setText] = useState("");
	const [files, setFiles] = useState<AttachmentFile[]>([]);
	const [model, setModel] = useState("GPT-5");
	const [effort, setEffort] = useState("Medium");
	const [sent, setSent] = useState<Submission | null>(null);
	const nextId = useRef(0);
	const picker = useRef<HTMLInputElement>(null);
	const textarea = useRef<HTMLTextAreaElement>(null);
	const effortLabel = (value: string) =>
		chinese ? ["低", "中", "高"][efforts.indexOf(value)] : value;
	const menus = [
		{
			key: "model",
			label: t("Model", "模型"),
			value: model,
			change: setModel,
			format: (value: string) => value,
			groups: models,
		},
		{
			key: "effort",
			label: t("Effort", "推理强度"),
			value: effort,
			change: setEffort,
			format: effortLabel,
			groups: [{ name: t("Effort", "推理强度"), items: efforts }],
		},
	];

	return (
		<section
			className="mx-auto grid w-full max-w-lg min-w-0 gap-3 px-4 py-6"
			aria-label={t("Prompt input", "提示词输入框")}
		>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					if (!text.trim()) return;
					setSent({ text: text.trim(), files, model, effort });
					setText("");
					setFiles([]);
					textarea.current?.focus();
				}}
			>
				<input
					ref={picker}
					type="file"
					hidden
					multiple
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
							className="flex-wrap gap-1.5"
							aria-label={t("Attachments", "附件")}
						>
							{files.map(({ id, file }) => (
								<Attachment key={id} size="sm" className="max-w-full min-w-0">
									<AttachmentMedia>
										<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
											<path d="M4 2.5h5l3 3v8H4zm5 0v3h3M6 8h4m-4 2h4" />
										</svg>
									</AttachmentMedia>
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
						value={text}
						onChange={(event) => setText(event.target.value)}
						aria-label={t("Message", "消息")}
						placeholder={t("Ask the agent to change your code…", "请助手修改你的代码…")}
						rows={2}
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
					<InputGroupAddon align="block-end" className="gap-2">
						<div className="flex min-w-0 flex-wrap gap-1">
							{menus.map(({ key, label, value, change, format, groups }) => (
								<DropdownMenu key={key}>
									<DropdownMenuTrigger asChild>
										<InputGroupButton
											size="xs"
											shape="pill"
											className="text-muted-foreground"
											aria-label={`${label}: ${format(value)}`}
										>
											{format(value)}
											<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
												<path d="m4 6 4 4 4-4" />
											</svg>
										</InputGroupButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent appearance="surface" align="start" className="min-w-36">
										<DropdownMenuRadioGroup value={value} onValueChange={change} aria-label={label}>
											{groups.map(({ name, items }) => (
												<DropdownMenuGroup key={name}>
													<DropdownMenuGroupHeading>{name}</DropdownMenuGroupHeading>
													{items.map((item) => (
														<DropdownMenuRadioItem key={item} value={item} closeOnSelect>
															{format(item)}
														</DropdownMenuRadioItem>
													))}
												</DropdownMenuGroup>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							))}
						</div>
						<div className="ms-auto flex shrink-0 gap-2">
							<InputGroupButton
								size="icon-xs"
								shape="pill"
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
							<InputGroupButton
								type="submit"
								size="icon-xs"
								shape="pill"
								variant="default"
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
						</div>
					</InputGroupAddon>
				</InputGroup>
			</form>
			<div role="status" className="grid min-w-0 gap-1 text-xs wrap-anywhere text-muted-foreground">
				{sent ? (
					<>
						<p>
							{t("Sent locally", "已在本地发送")} · {sent.model} · {t("Effort", "推理强度")}:{" "}
							{effortLabel(sent.effort)}
						</p>
						<p className="whitespace-pre-wrap text-foreground">{sent.text}</p>
						{sent.files.length > 0 && (
							<p>
								{t("Attachments", "附件")}: {sent.files.map(({ file }) => file.name).join(", ")}
							</p>
						)}
					</>
				) : (
					<p>
						{t(
							"Files stay in this preview. Add a message to send.",
							"文件仅保留在此预览中。输入消息后即可发送。"
						)}
					</p>
				)}
			</div>
		</section>
	);
}
