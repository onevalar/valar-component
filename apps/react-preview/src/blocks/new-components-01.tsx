"use client";

import { Avatar, AvatarFallback } from "@valar/react-ui/avatar";
import { Badge } from "@valar/react-ui/badge";
import { Button } from "@valar/react-ui/button";
import { ButtonGroup } from "@valar/react-ui/button-group";
import { Checkbox } from "@valar/react-ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/react-ui/command";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@valar/react-ui/empty";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from "@valar/react-ui/field";
import { Input } from "@valar/react-ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "@valar/react-ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@valar/react-ui/item";
import { NumberField } from "@valar/react-ui/number-field";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
import { RadioGroup, RadioGroupItem } from "@valar/react-ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/react-ui/select";
import { Slider } from "@valar/react-ui/slider";
import { Spinner } from "@valar/react-ui/spinner";
import { Switch } from "@valar/react-ui/switch";
import { Textarea } from "@valar/react-ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@valar/react-ui/tooltip";
import { useId, useRef, useState } from "react";

// Adapted from Valar's new-components-01 Svelte registry block (see repository LICENSE.md).
// No payments, invitations, MFA, audio capture, file uploads, integrations or AI requests are made.
type Translate = (english: string, chinese: string) => string;
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const years = ["2024", "2025", "2026", "2027", "2028", "2029"];
const mentionable = [
	["📝", "Meeting Notes", "会议记录"],
	["📊", "Project Dashboard", "项目仪表板"],
	["💡", "Ideas & Brainstorming", "灵感与头脑风暴"],
	["📅", "Calendar & Events", "日程与活动"],
	["📚", "Documentation", "文档"],
	["🎯", "Goals & Objectives", "目标"],
	["💰", "Budget Planning", "预算规划"],
	["👥", "Team Directory", "团队目录"],
	["🔧", "Technical Specs", "技术规范"],
	["📈", "Analytics Report", "分析报告"],
] as const;
const people = ["Valar", "maxleiter", "evilrabbit"];
const accents = ["bg-chart-2!", "bg-chart-3!", "bg-chart-4!", "bg-chart-5!"];

function Payment({ t }: { t: Translate }) {
	const id = useId();
	const [message, setMessage] = useState("");
	const [resetKey, setResetKey] = useState(0);
	return (
		<form
			aria-label={t("Payment Method", "付款方式")}
			className="min-w-0"
			autoComplete="off"
			onSubmit={(event) => {
				event.preventDefault();
				event.currentTarget.reset();
				setMessage(
					t("Demo form submitted. No payment was processed.", "演示表单已提交，未处理任何付款。")
				);
			}}
			onReset={() => {
				setResetKey((key) => key + 1);
				setMessage(t("Form cleared.", "表单已清空。"));
			}}
		>
			<FieldGroup>
				<FieldSet key={`payment-${resetKey}`}>
					<FieldLegend>{t("Payment Method", "付款方式")}</FieldLegend>
					<FieldDescription>
						{t(
							"Use sample values only. This form does not send or store card details.",
							"请仅使用示例值。此表单不会发送或保存卡片信息。"
						)}
					</FieldDescription>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={`${id}-name`}>{t("Name on Card", "持卡人姓名")}</FieldLabel>
							<Input id={`${id}-name`} placeholder="Evil Rabbit" required />
						</Field>
						<Field>
							<FieldLabel htmlFor={`${id}-number`}>{t("Card Number", "卡号")}</FieldLabel>
							<Input
								id={`${id}-number`}
								aria-describedby={`${id}-number-hint`}
								placeholder="1234 5678 9012 3456"
								inputMode="numeric"
								pattern="[0-9]{4} ?[0-9]{4} ?[0-9]{4} ?[0-9]{4}"
								maxLength={19}
								required
							/>
							<FieldDescription id={`${id}-number-hint`}>
								{t("Enter a 16-digit sample card number.", "请输入 16 位示例卡号。")}
							</FieldDescription>
						</Field>
						<div className="grid grid-cols-3 gap-2">
							{[
								["month", t("Month", "月份"), "MM", months],
								["year", t("Year", "年份"), "YYYY", years],
							].map(([field, label, placeholder, options]) => (
								<Field key={String(field)} className="min-w-0">
									<FieldLabel htmlFor={`${id}-${field}`}>{label}</FieldLabel>
									<Select required name={String(field)}>
										<SelectTrigger id={`${id}-${field}`} className="min-w-0">
											<SelectValue placeholder={String(placeholder)} />
										</SelectTrigger>
										<SelectContent>
											{(options as string[]).map((value) => (
												<SelectItem key={value} value={value}>
													{value}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							))}
							<Field className="min-w-0">
								<FieldLabel htmlFor={`${id}-cvv`}>CVV</FieldLabel>
								<Input
									id={`${id}-cvv`}
									placeholder="123"
									inputMode="numeric"
									pattern="[0-9]{3}"
									maxLength={3}
									required
									className="min-w-0"
								/>
							</Field>
						</div>
					</FieldGroup>
				</FieldSet>
				<FieldSeparator />
				<FieldSet key={`billing-${resetKey}`}>
					<FieldLegend>{t("Billing Address", "账单地址")}</FieldLegend>
					<Field orientation="horizontal">
						<Checkbox id={`${id}-same`} defaultChecked />
						<FieldLabel htmlFor={`${id}-same`}>
							{t("Same as shipping address", "与收货地址相同")}
						</FieldLabel>
					</Field>
				</FieldSet>
				<FieldSeparator />
				<Field key={`comments-${resetKey}`}>
					<FieldLabel htmlFor={`${id}-comments`}>{t("Comments", "备注")}</FieldLabel>
					<Textarea
						id={`${id}-comments`}
						placeholder={t("Add any additional comments", "添加备注")}
					/>
				</Field>
				<div className="flex flex-wrap gap-2">
					<Button type="submit">{t("Submit", "提交")}</Button>
					<Button type="reset" variant="outline">
						{t("Cancel", "取消")}
					</Button>
				</div>
				<output role="status" className="text-xs text-muted-foreground">
					{message}
				</output>
			</FieldGroup>
		</form>
	);
}

function Appearance({ t, chinese }: { t: Translate; chinese: boolean }) {
	const id = useId();
	const [accent, setAccent] = useState("0");
	const [compute, setCompute] = useState("kubernetes");
	const [tint, setTint] = useState(true);
	return (
		<FieldSet>
			<FieldLegend>{t("Appearance Settings", "外观设置")}</FieldLegend>
			<FieldDescription>
				{t("These settings affect only this sample.", "这些设置仅影响此示例。")}
			</FieldDescription>
			<FieldGroup>
				<FieldSet>
					<FieldLegend id={`${id}-compute`}>{t("Compute Environment", "计算环境")}</FieldLegend>
					<FieldDescription>
						{t("Select the compute environment for your cluster.", "选择集群的计算环境。")}
					</FieldDescription>
					<RadioGroup
						aria-labelledby={`${id}-compute`}
						value={compute}
						onValueChange={setCompute}
						className="gap-2"
					>
						{[
							[
								"kubernetes",
								"Kubernetes",
								t("Run GPU workloads on a K8s cluster.", "在 K8s 集群上运行 GPU 工作负载。"),
							],
							[
								"vm",
								t("Virtual Machine", "虚拟机"),
								t("Access a VM configured cluster. (Coming soon)", "访问虚拟机集群（即将推出）。"),
							],
						].map(([value, label, description]) => (
							<div
								key={value}
								className="flex items-center gap-2 rounded-lg border-[0.5px] border-border p-3 has-aria-checked:border-primary"
							>
								<FieldContent className="min-w-0">
									<FieldLabel htmlFor={`${id}-${value}`} className="cursor-pointer">
										{label}
									</FieldLabel>
									<FieldDescription id={`${id}-${value}-description`}>
										{description}
									</FieldDescription>
								</FieldContent>
								<RadioGroupItem
									id={`${id}-${value}`}
									value={value}
									aria-describedby={`${id}-${value}-description`}
								/>
							</div>
						))}
					</RadioGroup>
				</FieldSet>
				<FieldSeparator />
				<Field>
					<FieldTitle id={`${id}-accent`}>{t("Accent", "强调色")}</FieldTitle>
					<RadioGroup
						value={accent}
						onValueChange={setAccent}
						aria-labelledby={`${id}-accent`}
						className="flex flex-wrap gap-2"
					>
						{accents.map((color, index) => (
							<RadioGroupItem
								key={color}
								value={String(index)}
								aria-label={`${t("Accent", "强调色")} ${index + 1}`}
								className={`size-6! ${color} border-border!`}
							/>
						))}
					</RadioGroup>
				</Field>
				<FieldSeparator />
				<Field>
					<FieldLabel htmlFor={`${id}-gpu`}>{t("Number of GPUs", "GPU 数量")}</FieldLabel>
					<FieldDescription>{t("You can add more later.", "稍后可以添加更多。")}</FieldDescription>
					<NumberField
						id={`${id}-gpu`}
						min={1}
						max={999}
						defaultValue={8}
						locale={chinese ? "zh-CN" : "en-US"}
						decrementLabel={t("Decrease", "减小")}
						incrementLabel={t("Increase", "增大")}
					/>
				</Field>
				<FieldSeparator />
				<Field orientation="horizontal">
					<FieldContent>
						<FieldLabel htmlFor={`${id}-tint`}>{t("Wallpaper Tinting", "壁纸着色")}</FieldLabel>
						<FieldDescription>
							{t("Allow the wallpaper to be tinted.", "允许为壁纸着色。")}
						</FieldDescription>
					</FieldContent>
					<Switch id={`${id}-tint`} checked={tint} onCheckedChange={setTint} />
				</Field>
				<div
					aria-hidden="true"
					className={`h-8 rounded-lg border-[0.5px] border-border ${tint ? accents[Number(accent)] : "bg-muted"}`}
				/>
			</FieldGroup>
		</FieldSet>
	);
}

function Prompt({ t }: { t: Translate }) {
	const fileInput = useRef<HTMLInputElement>(null);
	const [text, setText] = useState("");
	const [mentions, setMentions] = useState<string[]>([]);
	const [files, setFiles] = useState<string[]>([]);
	const [contextOpen, setContextOpen] = useState(false);
	const [model, setModel] = useState("auto");
	const [web, setWeb] = useState(true);
	const [apps, setApps] = useState(true);
	const [scope, setScope] = useState("all");
	const [result, setResult] = useState("");
	const modes = [
		["auto", t("Auto", "自动")],
		["agent", t("Agent Mode", "代理模式")],
		["plan", t("Plan Mode", "计划模式")],
	];
	const scopes = [
		["all", t("All Sources I can access", "我可访问的全部来源")],
		["help", t("Help Center", "帮助中心")],
	];
	const context = [
		...mentionable.map(([icon, key, translation]) => ({
			icon,
			key,
			label: t(key, translation),
			page: true,
		})),
		...people.map((key) => ({ icon: "", key, label: key, page: false })),
	];
	return (
		<form
			aria-label={t("Notion Prompt", "Notion 提示词")}
			className="min-w-0"
			onSubmit={(event) => {
				event.preventDefault();
				if (!text.trim()) return;
				setResult(
					`${t("Prompt submitted locally. No AI request was sent.", "提示词已在本地提交，未发送 AI 请求。")}`
				);
				setText("");
				setMentions([]);
				setFiles([]);
			}}
		>
			<InputGroup appearance="composer" className="min-w-0">
				<InputGroupTextarea
					aria-label={t("Prompt", "提示词")}
					placeholder={t("Ask, search, or make anything...", "提问、搜索或创建内容…")}
					value={text}
					onChange={(event) => setText(event.currentTarget.value)}
				/>
				<InputGroupAddon align="block-start" className="flex-wrap">
					<Popover open={contextOpen} onOpenChange={setContextOpen}>
						<PopoverTrigger asChild>
							<InputGroupButton variant="outline" size="sm">
								<span aria-hidden="true">@</span> {t("Add context", "添加上下文")}
							</InputGroupButton>
						</PopoverTrigger>
						<PopoverContent
							aria-label={t("Add context", "添加上下文")}
							align="start"
							className="w-64 max-w-[calc(100vw-16px)] p-0!"
						>
							<Command>
								<CommandInput
									aria-label={t("Search pages", "搜索页面")}
									placeholder={t("Search pages...", "搜索页面…")}
								/>
								<CommandList>
									<CommandEmpty>{t("No pages found", "未找到页面")}</CommandEmpty>
									{[true, false].map((page) => (
										<CommandGroup
											key={String(page)}
											heading={page ? t("Pages", "页面") : t("Users", "用户")}
										>
											{context
												.filter((item) => item.page === page && !mentions.includes(item.key))
												.map(({ icon, key, label }) => (
													<CommandItem
														key={key}
														value={key}
														keywords={[label]}
														onSelect={() => {
															setMentions([...mentions, key]);
															setContextOpen(false);
														}}
													>
														<span aria-hidden="true">{icon || "@"}</span>
														{label}
													</CommandItem>
												))}
										</CommandGroup>
									))}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					{mentions.map((mention) => (
						<InputGroupButton
							key={mention}
							variant="secondary"
							size="sm"
							aria-label={`${t("Remove", "移除")} ${context.find((item) => item.key === mention)?.label}`}
							onClick={() => setMentions(mentions.filter((item) => item !== mention))}
						>
							{context.find((item) => item.key === mention)?.label}{" "}
							<span aria-hidden="true">×</span>
						</InputGroupButton>
					))}
				</InputGroupAddon>
				{files.length > 0 && (
					<InputGroupAddon align="block-start" className="flex-wrap">
						{files.map((file) => (
							<InputGroupButton
								key={file}
								variant="secondary"
								size="sm"
								className="max-w-full"
								aria-label={`${t("Remove attachment", "移除附件")} ${file}`}
								onClick={() => setFiles(files.filter((item) => item !== file))}
							>
								<span className="truncate">{file}</span>
								<span aria-hidden="true">×</span>
							</InputGroupButton>
						))}
					</InputGroupAddon>
				)}
				<InputGroupAddon align="block-end" className="flex-wrap gap-1">
					<input
						type="file"
						multiple
						hidden
						ref={fileInput}
						onChange={(event) => {
							setFiles((previous) =>
								Array.from(
									new Set([
										...previous,
										...Array.from(event.currentTarget.files ?? [], (file) => file.name),
									])
								)
							);
							event.currentTarget.value = "";
						}}
					/>
					<InputGroupButton
						size="icon-sm"
						aria-label={t("Attach file", "附加文件")}
						onClick={() => fileInput.current?.click()}
					>
						<span aria-hidden="true">＋</span>
					</InputGroupButton>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<InputGroupButton
								size="sm"
								aria-label={`${t("Select AI model", "选择 AI 模型")}: ${modes.find(([key]) => key === model)?.[1]}`}
							>
								{modes.find(([key]) => key === model)?.[1]}
							</InputGroupButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent appearance="surface" side="top">
							<DropdownMenuRadioGroup value={model} onValueChange={setModel}>
								{modes.map(([key, label]) => (
									<DropdownMenuRadioItem key={key} value={key}>
										{label}
										{key === "agent" && <Badge variant="secondary">Beta</Badge>}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<InputGroupButton size="sm">
								{scopes.find(([key]) => key === scope)?.[0] === "help"
									? t("Help Center", "帮助中心")
									: scope === "all"
										? t("All Sources", "全部来源")
										: scope}
							</InputGroupButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent appearance="surface" side="top" align="end" className="min-w-52">
							<DropdownMenuCheckboxItem
								checked={web}
								onCheckedChange={setWeb}
								onSelect={(event) => event.preventDefault()}
							>
								{t("Web Search", "网页搜索")}
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={apps}
								onCheckedChange={setApps}
								onSelect={(event) => event.preventDefault()}
							>
								{t("Apps and Integrations", "应用与集成")}
							</DropdownMenuCheckboxItem>
							<DropdownMenuSeparator />
							<DropdownMenuRadioGroup value={scope} onValueChange={setScope}>
								{scopes.map(([key, label]) => (
									<DropdownMenuRadioItem key={key} value={key}>
										{label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									{t("Valar workspace", "Valar 工作区")}
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent appearance="surface">
									{people.map((person) => (
										<DropdownMenuItem key={person} onSelect={() => setScope(person)}>
											{person}
										</DropdownMenuItem>
									))}
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuItem
								onSelect={() =>
									setResult(
										t("Connect Apps requires a host integration.", "连接应用需要宿主集成。")
									)
								}
							>
								{t("Connect Apps", "连接应用")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<InputGroupButton
						type="submit"
						variant="default"
						size="icon-sm"
						className="ms-auto"
						aria-label={t("Send prompt", "发送提示词")}
						disabled={!text.trim()}
					>
						<span aria-hidden="true">↑</span>
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
			<output role="status" className="text-xs text-muted-foreground">
				{result}
			</output>
		</form>
	);
}

export default function NewComponents01({ chinese = false }: { chinese?: boolean }) {
	const t: Translate = (english, translation) => (chinese ? translation : english);
	const id = useId();
	const [invited, setInvited] = useState(false);
	const [voice, setVoice] = useState(false);
	const [budget, setBudget] = useState([200, 800]);
	const [query, setQuery] = useState("");
	const [quickText, setQuickText] = useState("");
	const [quickMode, setQuickMode] = useState("Auto");
	const [quickStatus, setQuickStatus] = useState("");
	const [favorite, setFavorite] = useState(false);
	const [verified, setVerified] = useState(false);
	const [mfa, setMfa] = useState(false);
	const [page, setPage] = useState(1);
	const [label, setLabel] = useState("personal");
	const [mail, setMail] = useState("");
	const [copilot, setCopilot] = useState(false);
	const [task, setTask] = useState("");
	const [taskStatus, setTaskStatus] = useState("");
	const [processing, setProcessing] = useState(true);
	const searchItems = [
		...mentionable.map(([, key, translation]) => t(key, translation)),
		people[0],
		people[1],
	];
	const results = searchItems.filter((item) =>
		item.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
	);
	const modes = [
		["Auto", "自动"],
		["Agent", "代理"],
		["Manual", "手动"],
	];
	const mailActions = [
		["Mark as Read", "标为已读"],
		["Archive", "归档"],
		["Snooze", "暂缓"],
		["Add to Calendar", "添加到日历"],
		["Add to List", "添加到列表"],
		["Trash", "移至回收站"],
	];
	const labelOptions = [
		["personal", t("Personal", "个人")],
		["work", t("Work", "工作")],
		["other", t("Other", "其他")],
	];
	const preview = t("Local demo only.", "仅作本地演示。");
	return (
		<TooltipProvider>
			<section
				aria-label={t("New Components", "新组件")}
				className="@container/gallery mx-auto w-full max-w-[2200px] min-w-0 p-4 sm:p-6"
			>
				<div className="grid gap-6 @min-[1360px]/gallery:grid-cols-4 @2xl/gallery:grid-cols-2 @5xl/gallery:grid-cols-3">
					<div className="min-w-0">
						<Payment t={t} />
					</div>
					<div className="grid min-w-0 content-start gap-6">
						<Empty className="border-[0.5px] border-border">
							<EmptyHeader>
								<EmptyMedia>
									<div className="flex -space-x-1" aria-hidden="true">
										{["V", "LR", "ER"].map((initials) => (
											<Avatar key={initials}>
												<AvatarFallback>{initials}</AvatarFallback>
											</Avatar>
										))}
									</div>
								</EmptyMedia>
								<EmptyTitle>{t("No Team Members", "暂无团队成员")}</EmptyTitle>
								<EmptyDescription>
									{t(
										"Invite your team to collaborate on this project.",
										"邀请团队协作完成此项目。"
									)}
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button size="sm" onClick={() => setInvited(!invited)}>
									{invited ? t("Undo invitation", "撤销邀请") : t("Invite Members", "邀请成员")}
								</Button>
								{invited && (
									<output role="status">
										{t("Sample invitation created locally.", "已在本地创建示例邀请。")}
									</output>
								)}
							</EmptyContent>
						</Empty>
						<ButtonGroup className="w-full min-w-0" aria-label={t("Message controls", "消息控件")}>
							<Button
								variant="outline"
								size="icon"
								aria-label={t("Add message context", "添加消息上下文")}
								onClick={() => setQuickStatus(`${t("Message context", "消息上下文")} · ${preview}`)}
							>
								<span aria-hidden="true">＋</span>
							</Button>
							<InputGroup className="min-w-0">
								<InputGroupInput
									disabled={voice}
									aria-label={t("Message", "消息")}
									placeholder={
										voice
											? t("Record and send audio...", "录制并发送音频…")
											: t("Send a message...", "发送消息…")
									}
								/>
								<InputGroupAddon align="inline-end">
									<Tooltip>
										<TooltipTrigger asChild>
											<InputGroupButton
												size="icon-xs"
												aria-label={t("Voice Mode", "语音模式")}
												aria-pressed={voice}
												onClick={() => setVoice(!voice)}
											>
												<span aria-hidden="true">◉</span>
											</InputGroupButton>
										</TooltipTrigger>
										<TooltipContent>{t("Voice Mode", "语音模式")}</TooltipContent>
									</Tooltip>
								</InputGroupAddon>
							</InputGroup>
						</ButtonGroup>
						{voice && (
							<p className="-mt-4 text-xs text-muted-foreground">
								{t("Voice mode preview. No audio is recorded.", "语音模式预览，不会录音。")}
							</p>
						)}
						<Field>
							<FieldTitle>{t("Price Range", "价格范围")}</FieldTitle>
							<FieldDescription>
								{t("Set your budget range", "设置预算范围")}{" "}
								<span className="tabular-nums">
									(${budget[0]}–${budget[1]})
								</span>
							</FieldDescription>
							<Slider
								type="multiple"
								value={budget}
								onValueChange={setBudget}
								min={0}
								max={1000}
								step={10}
								thumbLabels={[t("Minimum price", "最低价格"), t("Maximum price", "最高价格")]}
								className="mt-2"
							/>
						</Field>
						<div className="grid gap-2">
							<InputGroup>
								<InputGroupAddon aria-hidden="true">⌕</InputGroupAddon>
								<InputGroupInput
									aria-label={t("Search", "搜索")}
									placeholder={t("Search...", "搜索…")}
									value={query}
									onChange={(event) => setQuery(event.currentTarget.value)}
								/>
								<InputGroupAddon align="inline-end">
									<output>
										{results.length} {t("results", "项结果")}
									</output>
								</InputGroupAddon>
							</InputGroup>
							{query.trim() && (
								<ul
									className="grid gap-1 text-xs text-muted-foreground"
									aria-label={t("Search results", "搜索结果")}
								>
									{results.length ? (
										results.map((item) => <li key={item}>{item}</li>)
									) : (
										<li>{t("No results", "没有结果")}</li>
									)}
								</ul>
							)}
							<InputGroup>
								<InputGroupAddon aria-hidden="true">
									<InputGroupText>https://</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput
									aria-label={t("Example domain", "示例域名")}
									placeholder="example.com"
								/>
								<InputGroupAddon align="inline-end">
									<Tooltip>
										<TooltipTrigger asChild>
											<InputGroupButton
												size="icon-xs"
												aria-label={t("About this URL", "关于此网址")}
											>
												<span aria-hidden="true">ⓘ</span>
											</InputGroupButton>
										</TooltipTrigger>
										<TooltipContent>
											{t("This is content in a tooltip.", "这是工具提示中的内容。")}
										</TooltipContent>
									</Tooltip>
								</InputGroupAddon>
							</InputGroup>
							<form
								onSubmit={(event) => {
									event.preventDefault();
									if (quickText.trim()) {
										setQuickStatus(
											`${t("Message sent locally", "消息已在本地发送")} · ${quickMode}`
										);
										setQuickText("");
									}
								}}
							>
								<InputGroup>
									<InputGroupTextarea
										aria-label={t("Ask, Search or Chat", "提问、搜索或聊天")}
										placeholder={t("Ask, Search or Chat...", "提问、搜索或聊天…")}
										value={quickText}
										onChange={(event) => setQuickText(event.currentTarget.value)}
									/>
									<InputGroupAddon align="block-end" className="flex-wrap">
										<InputGroupButton
											variant="outline"
											size="icon-xs"
											aria-label={t("Add", "添加")}
											onClick={() =>
												setQuickStatus(`${t("Add context", "添加上下文")} · ${preview}`)
											}
										>
											<span aria-hidden="true">＋</span>
										</InputGroupButton>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<InputGroupButton size="sm">
													{modes.find(([key]) => key === quickMode)?.[chinese ? 1 : 0]}
												</InputGroupButton>
											</DropdownMenuTrigger>
											<DropdownMenuContent side="top" appearance="surface">
												<DropdownMenuRadioGroup value={quickMode} onValueChange={setQuickMode}>
													{modes.map(([key, translation]) => (
														<DropdownMenuRadioItem key={key} value={key}>
															{t(key, translation)}
														</DropdownMenuRadioItem>
													))}
												</DropdownMenuRadioGroup>
											</DropdownMenuContent>
										</DropdownMenu>
										<InputGroupText className="ms-auto">
											{Math.min(100, Math.round(quickText.length / 5))}% {t("used", "已用")}
										</InputGroupText>
										<InputGroupButton
											type="submit"
											variant="default"
											size="icon-xs"
											aria-label={t("Send message", "发送消息")}
											disabled={!quickText.trim()}
										>
											<span aria-hidden="true">↑</span>
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
							</form>
							<output className="text-xs text-muted-foreground" role="status">
								{quickStatus}
							</output>
							<InputGroup>
								<InputGroupInput aria-label={t("Handle", "昵称")} placeholder="@valar" />
								<InputGroupAddon align="inline-end" aria-hidden="true">
									<span className="text-primary">✓</span>
								</InputGroupAddon>
							</InputGroup>
						</div>
					</div>
					<div className="grid min-w-0 content-start gap-4">
						<Item variant="outline">
							<ItemContent>
								<ItemTitle>{t("Two-factor authentication", "双重身份验证")}</ItemTitle>
								<ItemDescription>
									{mfa
										? t("Enabled in this preview only.", "仅在此预览中启用。")
										: t("Verify via email or phone number.", "通过电子邮件或电话号码验证。")}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button size="sm" aria-pressed={mfa} onClick={() => setMfa(!mfa)}>
									{mfa ? t("Disable", "停用") : t("Enable", "启用")}
								</Button>
							</ItemActions>
						</Item>
						<Item variant="outline" size="sm">
							<ItemContent>
								<ItemTitle>
									{t("Your profile has been verified.", "你的个人资料已验证。")}
								</ItemTitle>
								{verified && (
									<ItemDescription>
										{t(
											"This is sample verification, not a real account.",
											"这是示例验证，并非真实账户。"
										)}
									</ItemDescription>
								)}
							</ItemContent>
							<ItemActions>
								<Button
									size="icon-sm"
									variant="ghost"
									aria-label={t("Verification details", "验证详情")}
									aria-expanded={verified}
									onClick={() => setVerified(!verified)}
								>
									<span aria-hidden="true">›</span>
								</Button>
							</ItemActions>
						</Item>
						<Appearance t={t} chinese={chinese} />
					</div>
					<div className="grid min-w-0 content-start gap-4">
						<div className="flex flex-wrap gap-2">
							<Badge>
								<Spinner aria-hidden="true" />
								{t("Syncing", "同步中")}
							</Badge>
							<Badge variant="secondary">
								<Spinner aria-hidden="true" />
								{t("Updating", "更新中")}
							</Badge>
							<Badge variant="outline">
								<Spinner aria-hidden="true" />
								{t("Processing", "处理中")}
							</Badge>
						</div>
						<InputGroup>
							<InputGroupAddon>
								<Popover>
									<PopoverTrigger asChild>
										<InputGroupButton
											size="icon-xs"
											variant="secondary"
											aria-label={t("Info", "信息")}
										>
											<span aria-hidden="true">ⓘ</span>
										</InputGroupButton>
									</PopoverTrigger>
									<PopoverContent
										aria-label={t("Connection information", "连接信息")}
										align="start"
									>
										<p className="font-medium">
											{t("Your connection is not secure.", "你的连接不安全。")}
										</p>
										<p>
											{t(
												"This is sample text. Do not enter sensitive information.",
												"这是示例文字，请勿输入敏感信息。"
											)}
										</p>
									</PopoverContent>
								</Popover>
								<InputGroupText>https://</InputGroupText>
							</InputGroupAddon>
							<InputGroupInput aria-label={t("Input Secure", "安全输入示例")} />
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									size="icon-xs"
									aria-label={t("Favorite", "收藏")}
									aria-pressed={favorite}
									onClick={() => setFavorite(!favorite)}
								>
									<span aria-hidden="true" className={favorite ? "text-primary" : ""}>
										{favorite ? "★" : "☆"}
									</span>
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
						<Prompt t={t} />
						<div className="grid gap-2">
							<ButtonGroup aria-label={t("Mail actions", "邮件操作")}>
								<Button
									variant="outline"
									size="icon-sm"
									aria-label={t("Go Back", "返回")}
									onClick={() => setMail("")}
								>
									<span aria-hidden="true">←</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setMail(t("Archived locally", "已在本地归档"))}
								>
									{t("Archive", "归档")}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setMail(t("Snoozed locally", "已在本地暂缓"))}
								>
									{t("Snooze", "暂缓")}
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="icon-sm"
											aria-label={t("More Options", "更多选项")}
										>
											<span aria-hidden="true">⋯</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" appearance="surface" className="min-w-40">
										{mailActions.slice(0, -1).map(([key, translation]) => (
											<DropdownMenuItem
												key={key}
												onSelect={() => setMail(`${t(key, translation)} · ${preview}`)}
											>
												{t(key, translation)}
											</DropdownMenuItem>
										))}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>
												{t("Label As...", "添加标签…")}
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent appearance="surface">
												<DropdownMenuRadioGroup
													value={label}
													onValueChange={(value) => {
														setLabel(value);
														setMail(labelOptions.find(([key]) => key === value)?.[1] ?? "");
													}}
												>
													{labelOptions.map(([key, text]) => (
														<DropdownMenuRadioItem key={key} value={key}>
															{text}
														</DropdownMenuRadioItem>
													))}
												</DropdownMenuRadioGroup>
											</DropdownMenuSubContent>
										</DropdownMenuSub>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onSelect={() => setMail(`${t("Trash", "移至回收站")} · ${preview}`)}
										>
											{t("Trash", "移至回收站")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</ButtonGroup>
							<output role="status" className="text-xs text-muted-foreground">
								{mail}
							</output>
						</div>
						<Field orientation="horizontal">
							<Checkbox id={`${id}-terms`} defaultChecked />
							<FieldLabel htmlFor={`${id}-terms`}>
								{t("I agree to the terms and conditions", "我同意条款与条件")}
							</FieldLabel>
						</Field>
						<div className="flex flex-wrap gap-2">
							<ButtonGroup aria-label={t("Pages", "页码")}>
								<ButtonGroup>
									{[1, 2, 3, 4, 5].map((value) => (
										<Button
											key={value}
											variant={page === value ? "secondary" : "outline"}
											size="sm"
											aria-current={page === value ? "page" : undefined}
											onClick={() => setPage(value)}
										>
											{value}
										</Button>
									))}
								</ButtonGroup>
								<ButtonGroup>
									<Button
										variant="outline"
										size="icon-sm"
										aria-label={t("Previous", "上一页")}
										disabled={page === 1}
										onClick={() => setPage(page - 1)}
									>
										<span aria-hidden="true">‹</span>
									</Button>
									<Button
										variant="outline"
										size="icon-sm"
										aria-label={t("Next", "下一页")}
										disabled={page === 5}
										onClick={() => setPage(page + 1)}
									>
										<span aria-hidden="true">›</span>
									</Button>
								</ButtonGroup>
							</ButtonGroup>
							<Popover open={copilot} onOpenChange={setCopilot}>
								<ButtonGroup>
									<PopoverTrigger asChild>
										<Button variant="outline" size="sm">
											Copilot
										</Button>
									</PopoverTrigger>
									<Button
										variant="outline"
										size="icon-sm"
										aria-label={t("Open Popover", "打开弹出层")}
										aria-expanded={copilot}
										onClick={() => setCopilot(!copilot)}
									>
										<span aria-hidden="true">⌄</span>
									</Button>
								</ButtonGroup>
								<PopoverContent
									aria-label={t("Agent Tasks", "代理任务")}
									align="start"
									className="max-w-[calc(100vw-16px)]"
								>
									<form
										className="grid gap-2"
										onSubmit={(event) => {
											event.preventDefault();
											if (task.trim()) {
												setTaskStatus(
													t(
														"Task saved locally. No pull request was created.",
														"任务已在本地保存，未创建拉取请求。"
													)
												);
												setTask("");
												setCopilot(false);
											}
										}}
									>
										<p className="font-medium">{t("Agent Tasks", "代理任务")}</p>
										<Textarea
											aria-label={t("Describe your task", "描述任务")}
											placeholder={t(
												"Describe your task in natural language.",
												"用自然语言描述任务。"
											)}
											value={task}
											onChange={(event) => setTask(event.currentTarget.value)}
										/>
										<p className="text-xs text-muted-foreground">
											{t(
												"Start a new task with Copilot. This preview does not run agents.",
												"用 Copilot 开始新任务。此预览不会运行代理。"
											)}
										</p>
										<Button type="submit" disabled={!task.trim()}>
											{t("Save task", "保存任务")}
										</Button>
									</form>
								</PopoverContent>
							</Popover>
						</div>
						<output role="status" className="text-xs text-muted-foreground">
							{taskStatus}
						</output>
						<Empty className="border-[0.5px] border-border">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									{processing ? <Spinner aria-hidden="true" /> : <span aria-hidden="true">×</span>}
								</EmptyMedia>
								<EmptyTitle>
									{processing
										? t("Processing your request", "正在处理你的请求")
										: t("Request canceled", "请求已取消")}
								</EmptyTitle>
								<EmptyDescription>
									{processing
										? t("This is a sample loading state.", "这是示例加载状态。")
										: t("You can restart this demonstration.", "你可以重新开始此演示。")}
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button variant="outline" size="sm" onClick={() => setProcessing(!processing)}>
									{processing ? t("Cancel", "取消") : t("Restart", "重新开始")}
								</Button>
							</EmptyContent>
						</Empty>
					</div>
				</div>
			</section>
		</TooltipProvider>
	);
}
