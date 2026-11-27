import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupHeading,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
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

export default function ModelSelectorExample({ chinese = false }: { chinese?: boolean }) {
	const t = (english: string, zh: string) => (chinese ? zh : english);
	const [model, setModel] = useState("GPT-5");
	const [effort, setEffort] = useState("Medium");
	const [text, setText] = useState("");
	const [sent, setSent] = useState<{ model: string; effort: string } | null>(null);
	const textarea = useRef<HTMLTextAreaElement>(null);
	const effortLabel = (value: string) =>
		chinese ? ["低", "中", "高"][efforts.indexOf(value)] : value;
	const menus = [
		{ label: t("Model", "模型"), value: model, display: model, change: setModel, groups: models },
		{
			label: t("Effort", "推理强度"),
			value: effort,
			display: effortLabel(effort),
			change: setEffort,
			groups: [{ name: t("Effort", "推理强度"), items: efforts }],
		},
	];
	return (
		<section
			className="mx-auto grid w-full max-w-lg min-w-0 gap-2 px-4 py-6"
			aria-label={t("Model selector", "模型选择器")}
		>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					if (!text.trim()) return;
					setSent({ model, effort });
					setText("");
					textarea.current?.focus();
				}}
			>
				<InputGroup appearance="composer">
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
							{menus.map(({ label, value, display, change, groups }, menuIndex) => (
								<DropdownMenu key={label}>
									<DropdownMenuTrigger asChild>
										<InputGroupButton
											size="xs"
											shape="pill"
											aria-label={`${label}: ${display}`}
											className="text-muted-foreground"
										>
											{display}
											<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
												<path d="m4 6 4 4 4-4" />
											</svg>
										</InputGroupButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent appearance="surface" align="start" className="min-w-36">
										<DropdownMenuRadioGroup value={value} onValueChange={change} aria-label={label}>
											{groups.map(({ name, items }, index) => (
												<DropdownMenuGroup key={name}>
													{index > 0 && <DropdownMenuSeparator />}
													<DropdownMenuGroupHeading>{name}</DropdownMenuGroupHeading>
													{items.map((item) => (
														<DropdownMenuRadioItem key={item} value={item} closeOnSelect>
															{menuIndex === 0 ? item : effortLabel(item)}
														</DropdownMenuRadioItem>
													))}
												</DropdownMenuGroup>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							))}
						</div>
						<InputGroupButton
							type="submit"
							size="icon-xs"
							shape="pill"
							variant="default"
							className="ms-auto shrink-0"
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
			<p role="status" className="text-xs text-muted-foreground">
				{sent
					? `${t("Sent locally", "已在本地发送")} · ${sent.model} · ${t("Effort", "推理强度")}: ${effortLabel(sent.effort)}`
					: t(
							"Choose a model and effort, then send a local sample.",
							"选择模型和推理强度，再发送一条本地示例消息。"
						)}
			</p>
		</section>
	);
}
