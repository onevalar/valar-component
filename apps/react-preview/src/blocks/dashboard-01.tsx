"use client";

import { Badge } from "@valar/react-ui/badge";
import { Button } from "@valar/react-ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@valar/react-ui/card";
import { Checkbox } from "@valar/react-ui/checkbox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@valar/react-ui/drawer";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import { Field, FieldLabel } from "@valar/react-ui/field";
import { Input } from "@valar/react-ui/input";
import { NativeSelect, NativeSelectOption } from "@valar/react-ui/native-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/react-ui/select";
import { Separator } from "@valar/react-ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@valar/react-ui/sidebar";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/react-ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/react-ui/tabs";
import { useId, useRef, useState } from "react";

// Adapted from the Valar Svelte dashboard-01 registry block (see repository LICENSE.md).
// Sample state only: no routing, persistence, analytics, sharing, or authentication backend.
type Translate = (english: string, chinese: string) => string;
type Section = {
	id: number;
	header: string;
	type: string;
	status: string;
	target: string;
	limit: string;
	reviewer: string;
	favorite?: boolean;
};
const sectionTypes = [
	"Cover page",
	"Table of contents",
	"Narrative",
	"Technical content",
	"Executive Summary",
	"Technical Approach",
	"Design",
	"Capabilities",
	"Focus Documents",
];
const statuses = ["In Process", "Done", "Not Started"];
const reviewers = ["Eddie Lake", "Jamik Tashpulatov", "Emily Whalen"];
const sections: Section[] = [
	["Cover page", 0, 0, 18, 5, 0],
	["Table of contents", 1, 1, 29, 24, 0],
	["Executive summary", 2, 1, 10, 13, 0],
	["Technical approach", 2, 1, 27, 23, 1],
	["Design", 2, 0, 2, 16, 1],
	["Capabilities", 2, 0, 20, 8, 1],
	["Integration with existing systems", 2, 0, 19, 21, 1],
	["Innovation and Advantages", 2, 1, 25, 26, -1],
	["Overview of EMR's Innovative Solutions", 3, 1, 7, 23, -1],
	["Advanced Algorithms and Machine Learning", 2, 1, 30, 28, -1],
	["Adaptive Communication Protocols", 2, 1, 9, 31, -1],
	["Advantages Over Current Technologies", 2, 1, 12, 0, -1],
	["Past Performance", 2, 1, 22, 33, -1],
	["Customer Feedback and Satisfaction Levels", 2, 1, 15, 34, -1],
].map(([header, type, status, target, limit, reviewer], index) => ({
	id: index + 1,
	header: String(header),
	type: sectionTypes[Number(type)],
	status: statuses[Number(status)],
	target: String(target),
	limit: String(limit),
	reviewer: reviewers[Number(reviewer)] ?? "",
}));

const desktop = [
	222, 97, 167, 242, 373, 301, 245, 409, 59, 261, 327, 292, 342, 137, 120, 138, 446, 364, 243, 89,
	137, 224, 138, 387, 215, 75, 383, 122, 315, 454, 165, 293, 247, 385, 481, 498, 388, 149, 227, 293,
	335, 197, 197, 448, 473, 338, 499, 315, 235, 177, 82, 81, 252, 294, 201, 213, 420, 233, 78, 340,
	178, 178, 470, 103, 439, 88, 294, 323, 385, 438, 155, 92, 492, 81, 426, 307, 371, 475, 107, 341,
	408, 169, 317, 480, 132, 141, 434, 448, 149, 103, 446,
];
const mobile = [
	150, 180, 120, 260, 290, 340, 180, 320, 110, 190, 350, 210, 380, 220, 170, 190, 360, 410, 180,
	150, 200, 170, 230, 290, 250, 130, 420, 180, 240, 380, 220, 310, 190, 420, 390, 520, 300, 210,
	180, 330, 270, 240, 160, 490, 380, 400, 420, 350, 180, 230, 140, 120, 290, 220, 250, 170, 460,
	190, 130, 280, 230, 200, 410, 160, 380, 140, 250, 370, 320, 480, 200, 150, 420, 130, 380, 350,
	310, 520, 170, 290, 450, 210, 270, 530, 180, 190, 380, 490, 200, 160, 400,
];
// The date range ends June 30 UTC; keep dates independent of viewer time zone.
const visitors = desktop.map((value, index) => ({
	desktop: value,
	mobile: mobile[index],
	date: Date.UTC(2024, 5, 30 - (desktop.length - 1 - index)),
}));
const sectionFields = ["header", "type", "status", "target", "limit", "reviewer"] as const;
type SectionField = (typeof sectionFields)[number];
const fieldLabels = {
	header: ["Header", "标题"],
	type: ["Section Type", "章节类型"],
	status: ["Status", "状态"],
	target: ["Target", "目标"],
	limit: ["Limit", "上限"],
	reviewer: ["Reviewer", "审阅者"],
} as const;

function Choice({
	value,
	options,
	label,
	id,
	onChange,
	className,
}: {
	value: string;
	options: readonly (readonly [string, string])[];
	label: string;
	id?: string;
	onChange: (value: string) => void;
	className?: string;
}) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger id={id} aria-label={label} size="sm" className={className}>
				<SelectValue placeholder={label} />
			</SelectTrigger>
			<SelectContent>
				{options.map(([key, name]) => (
					<SelectItem key={key} value={key}>
						{name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function Visitors({ t, chinese }: { t: Translate; chinese: boolean }) {
	const [range, setRange] = useState("90");
	const [cursor, setCursor] = useState<number | null>(null);
	const ranges = [
		["90", t("Last 3 months", "最近 3 个月")],
		["30", t("Last 30 days", "最近 30 天")],
		["7", t("Last 7 days", "最近 7 天")],
	] as const;
	const data = visitors.slice(-Number(range) - 1);
	const current = cursor === null ? null : data[cursor];
	const formatDate = new Intl.DateTimeFormat(chinese ? "zh-CN" : "en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
	const x = (i: number) => (800 * i) / (data.length - 1);
	const y = (value: number) => 172 - (value / 1200) * 172;
	const line = (getValue: (row: (typeof data)[number]) => number) =>
		data.map((row, i) => `${x(i)},${y(getValue(row))}`).join(" ");
	const total = line((row) => row.desktop + row.mobile);
	const lower = line((row) => row.mobile);
	return (
		<Card className="min-w-0">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<CardTitle>{t("Total Visitors", "访客总数")}</CardTitle>
						<CardDescription>{ranges.find(([key]) => key === range)?.[1]}</CardDescription>
					</div>
					<Choice
						label={t("Visitor date range", "访客日期范围")}
						value={range}
						options={ranges}
						onChange={(value) => {
							setRange(value);
							setCursor(null);
						}}
					/>
				</div>
			</CardHeader>
			<CardContent className="grid gap-2">
				<div className="relative rounded-lg focus-within:outline-1 focus-within:-outline-offset-1 focus-within:outline-ring">
					<svg
						role="img"
						aria-label={t(
							"Desktop and mobile visitors. Use arrow keys to read daily values.",
							"桌面端及移动端访客数。使用方向键查看每日数据。"
						)}
						tabIndex={0}
						viewBox="0 0 800 176"
						preserveAspectRatio="none"
						className="h-44 w-full rounded-lg outline-none"
						onFocus={() => setCursor((value) => value ?? data.length - 1)}
						onBlur={() => setCursor(null)}
						onPointerMove={(event) => {
							const box = event.currentTarget.getBoundingClientRect();
							setCursor(
								Math.max(
									0,
									Math.min(
										data.length - 1,
										Math.round(((event.clientX - box.left) / box.width) * (data.length - 1))
									)
								)
							);
						}}
						onPointerLeave={(event) => {
							if (document.activeElement !== event.currentTarget) setCursor(null);
						}}
						onKeyDown={(event) => {
							if (
								event.key !== "ArrowLeft" &&
								event.key !== "ArrowRight" &&
								event.key !== "Home" &&
								event.key !== "End"
							)
								return;
							event.preventDefault();
							setCursor((value) =>
								event.key === "Home"
									? 0
									: event.key === "End"
										? data.length - 1
										: Math.max(
												0,
												Math.min(
													data.length - 1,
													(value ?? 0) + (event.key === "ArrowLeft" ? -1 : 1)
												)
											)
							);
						}}
					>
						{[25, 74, 123, 172].map((mark) => (
							<path
								key={mark}
								d={`M0 ${mark}H800`}
								stroke="var(--border)"
								vectorEffect="non-scaling-stroke"
							/>
						))}
						<polygon points={`0,172 ${total} 800,172`} fill="var(--chart-1)" fillOpacity="0.25" />
						<polygon points={`0,172 ${lower} 800,172`} fill="var(--chart-2)" fillOpacity="0.5" />
						<polyline
							points={total}
							fill="none"
							stroke="var(--chart-1)"
							vectorEffect="non-scaling-stroke"
						/>
						<polyline
							points={lower}
							fill="none"
							stroke="var(--chart-2)"
							vectorEffect="non-scaling-stroke"
						/>
						{cursor !== null && (
							<path
								d={`M${x(cursor)} 0V172`}
								stroke="var(--foreground)"
								strokeDasharray="3 3"
								vectorEffect="non-scaling-stroke"
							/>
						)}
					</svg>
					{current && (
						<div
							aria-hidden="true"
							className={`cn-chart-tooltip pointer-events-none absolute top-1 ${cursor !== null && cursor >= data.length / 2 ? "start-1" : "end-1"}`}
						>
							{formatDate.format(current.date)} · {t("Desktop", "桌面端")} {current.desktop} ·{" "}
							{t("Mobile", "移动端")} {current.mobile}
						</div>
					)}
					<p className="sr-only" aria-live="polite">
						{current &&
							`${formatDate.format(current.date)} · ${t("Desktop", "桌面端")} ${current.desktop} · ${t("Mobile", "移动端")} ${current.mobile}`}
					</p>
				</div>
				<div className="flex justify-between text-xs text-muted-foreground tabular-nums">
					{[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) => (
						<span key={i}>{formatDate.format(data[i].date)}</span>
					))}
				</div>
				<div className="flex justify-center gap-4 text-xs text-muted-foreground">
					<span>
						<span className="me-1 inline-block size-2 rounded-sm bg-chart-1" />
						{t("Desktop", "桌面端")}
					</span>
					<span>
						<span className="me-1 inline-block size-2 rounded-sm bg-chart-2" />
						{t("Mobile", "移动端")}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export default function Dashboard01({ chinese = false }: { chinese?: boolean }) {
	const t: Translate = (english, translation) => (chinese ? translation : english);
	const id = useId();
	const [rows, setRows] = useState(sections);
	const [selected, setSelected] = useState<number[]>([]);
	const [hidden, setHidden] = useState<SectionField[]>([]);
	const [view, setView] = useState("outline");
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [favoriteNav, setFavoriteNav] = useState("Dashboard");
	const [documents, setDocuments] = useState(["Data Library", "Reports", "Word Assistant"]);
	const [draft, setDraft] = useState<Section | null>(null);
	const [drawerDirection, setDrawerDirection] = useState<"bottom" | "right">("right");
	const [message, setMessage] = useState("");
	const drag = useRef<number | null>(null);
	const opener = useRef<HTMLElement | null>(null);
	const addButton = useRef<HTMLButtonElement>(null);
	const boundary = useRef<HTMLHeadingElement>(null);
	const [dropTarget, setDropTarget] = useState<number | null>(null);
	const pages = Math.max(1, Math.ceil(rows.length / pageSize));
	const currentPage = Math.min(page, pages - 1);
	const pageRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
	const pageIds = pageRows.map((row) => row.id);
	const pageCount = pageIds.filter((key) => selected.includes(key)).length;
	const fields = sectionFields.filter((field) => !hidden.includes(field));
	const metrics = [
		[
			t("Total Revenue", "总收入"),
			"$1,250.00",
			"+12.5%",
			t("Trending up this month", "本月呈上升趋势"),
			t("Visitors for the last 6 months", "过去 6 个月的访客"),
		],
		[
			t("New Customers", "新增客户"),
			"1,234",
			"−20%",
			t("Down 20% this period", "本期下降 20%"),
			t("Acquisition needs attention", "需关注获客"),
		],
		[
			t("Active Accounts", "活跃账号"),
			"45,678",
			"+12.5%",
			t("Strong user retention", "用户留存良好"),
			t("Engagement exceeds targets", "参与度超出目标"),
		],
		[
			t("Growth Rate", "增长率"),
			"4.5%",
			"+4.5%",
			t("Steady performance increase", "稳步提升"),
			t("Meets growth projections", "符合增长预期"),
		],
	];
	const views = [
		["outline", t("Outline", "大纲"), 0],
		["past-performance", t("Past Performance", "历史业绩"), 3],
		["key-personnel", t("Key Personnel", "核心人员"), 2],
		["focus-documents", t("Focus Documents", "重点文档"), 0],
	] as const;
	const navGroups = [
		[
			["Dashboard", "仪表板", "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
			["Lifecycle", "生命周期", "M3 6h18M3 12h18M3 18h18"],
			["Analytics", "分析", "M4 20V4m0 16h16m-12-4v-5m5 5V7m5 9V4"],
			["Projects", "项目", "M3 6h7l2 2h9v11H3z"],
			[
				"Team",
				"团队",
				"M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
			],
		],
		[
			["Settings", "设置", "M5 4v16m7-16v16m7-16v16M3 8h4m3 7h4m3-6h4"],
			[
				"Get Help",
				"获取帮助",
				"M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01",
			],
			["Search", "搜索", "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 5 5"],
		],
	];
	const docNames: Record<string, string> = {
		"Data Library": "资料库",
		Reports: "报告",
		"Word Assistant": "文档助手",
	};
	const statusLabel = (status: string) =>
		t(status, status === "Done" ? "已完成" : status === "Not Started" ? "未开始" : "进行中");
	const fieldLabel = (field: SectionField) => t(fieldLabels[field][0], fieldLabels[field][1]);
	function localAction(label: string) {
		setMessage(`${label} · ${t("Preview only; no service connected.", "仅供预览；未连接服务。")}`);
	}
	function updateRow(key: number, update: Partial<Section>) {
		setRows((list) => list.map((row) => (row.id === key ? { ...row, ...update } : row)));
	}
	function moveRow(from: number, to: number) {
		const fromIndex = rows.findIndex((row) => row.id === from);
		const toIndex = rows.findIndex((row) => row.id === to);
		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
		const next = [...rows];
		const [row] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, row);
		setRows(next);
		setMessage(`${row.header} · ${t("Moved to position", "移至位置")} ${toIndex + 1}`);
	}
	function editRow(row: Section | undefined, trigger: HTMLElement | null) {
		opener.current = trigger;
		setDrawerDirection(window.matchMedia("(width < 48rem)").matches ? "bottom" : "right");
		setDraft(
			row
				? { ...row }
				: {
						id: 0,
						header: "",
						type: sectionTypes[2],
						status: statuses[2],
						target: "0",
						limit: "0",
						reviewer: "",
					}
		);
	}
	function saveRow() {
		if (!draft?.header.trim()) return;
		const next = { ...draft, header: draft.header.trim() };
		if (next.id) updateRow(next.id, next);
		else {
			next.id = Math.max(0, ...rows.map((row) => row.id)) + 1;
			setRows([...rows, next]);
			setView("outline");
			setPage(Math.floor(rows.length / pageSize));
		}
		setMessage(`${t("Saved", "已保存")} · ${next.header}`);
		setDraft(null);
	}
	function deleteRow(row: Section) {
		setRows(rows.filter(({ id }) => id !== row.id));
		setSelected(selected.filter((key) => key !== row.id));
		setPage(Math.min(currentPage, Math.max(0, Math.ceil((rows.length - 1) / pageSize) - 1)));
		setMessage(`${t("Deleted", "已删除")} · ${row.header}`);
	}
	const nav = (group: (typeof navGroups)[number]) => (
		<SidebarMenu>
			{group.map(([label, translation, path]) => (
				<SidebarMenuItem key={label}>
					<SidebarMenuButton
						isActive={favoriteNav === label}
						onClick={() => {
							setFavoriteNav(label);
							if (label === "Dashboard") setMessage("");
							else localAction(t(label, translation));
						}}
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.75"
						>
							<path d={path} />
						</svg>
						<span>{t(label, translation)}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);

	return (
		<SidebarProvider persistState={false} className="relative min-w-0 overflow-hidden">
			<Sidebar
				id={`${id}-nav`}
				variant="inset"
				mobileTitle={t("Dashboard navigation", "仪表板导航")}
				mobileDescription={t("Navigate sample documents and reports.", "浏览示例文档及报告。")}
				className="md:absolute md:h-full"
			>
				<SidebarHeader>
					<span className="px-2 py-1 text-base font-semibold">Acme Inc.</span>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup className="gap-2">
						<div className="flex gap-2 px-1">
							<Button
								className="grow"
								size="sm"
								onClick={(event) => editRow(undefined, event.currentTarget)}
							>
								<span aria-hidden="true">＋</span> {t("Quick Create", "快速创建")}
							</Button>
							<Button
								variant="outline"
								size="icon-sm"
								aria-label={t("Inbox", "收件箱")}
								onClick={() => localAction(t("Inbox", "收件箱"))}
							>
								<span aria-hidden="true">✉</span>
							</Button>
						</div>
						{nav(navGroups[0])}
					</SidebarGroup>
					<SidebarGroup>
						<SidebarGroupLabel>{t("Documents", "文档")}</SidebarGroupLabel>
						<SidebarMenu>
							{documents.map((item) => (
								<SidebarMenuItem key={item}>
									<SidebarMenuButton
										className="pe-9"
										onClick={() => localAction(t(item, docNames[item]))}
									>
										<span>{t(item, docNames[item])}</span>
									</SidebarMenuButton>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction
												aria-label={`${t("More options for", "更多选项：")} ${t(item, docNames[item])}`}
											>
												<span aria-hidden="true">⋯</span>
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent appearance="surface" align="end">
											<DropdownMenuItem onSelect={() => localAction(t(item, docNames[item]))}>
												{t("Open", "打开")}
											</DropdownMenuItem>
											<DropdownMenuItem onSelect={() => localAction(t("Share", "分享"))}>
												{t("Share", "分享")}
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onSelect={() => {
													setDocuments(documents.filter((name) => name !== item));
													setMessage(`${t("Removed", "已移除")} · ${t(item, docNames[item])}`);
												}}
											>
												{t("Delete", "删除")}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</SidebarMenuItem>
							))}
							<SidebarMenuItem>
								<SidebarMenuButton onClick={() => localAction(t("More documents", "更多文档"))}>
									{t("More", "更多")}
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
					<SidebarGroup className="mt-auto">{nav(navGroups[1])}</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton size="lg">
										<span
											className="grid size-7 place-items-center rounded-md bg-muted"
											aria-hidden="true"
										>
											V
										</span>
										<span className="grid text-start">
											Valar <small className="text-muted-foreground">m@example.com</small>
										</span>
										<span className="ms-auto" aria-hidden="true">
											⋮
										</span>
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent appearance="surface" align="end">
									{[
										["Account", "账户"],
										["Billing", "账单"],
										["Notifications", "通知"],
										["Log out", "退出登录"],
									].map(([label, translation]) => (
										<DropdownMenuItem
											key={label}
											onSelect={() => localAction(t(label, translation))}
										>
											{t(label, translation)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset className="@container/dashboard min-w-0">
				<header className="flex min-h-12 flex-wrap items-center gap-2 border-b px-4">
					<SidebarTrigger label={t("Toggle Sidebar", "切换侧栏")} aria-controls={`${id}-nav`} />
					<Separator orientation="vertical" className="h-4! self-auto!" />
					<h1
						ref={boundary}
						tabIndex={-1}
						className="text-base font-medium focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
					>
						{t("Documents", "文档")}
					</h1>
					<Button
						href="https://github.com/onevalar/valar-component/tree/main/docs/src/lib/registry/blocks/dashboard-01"
						variant="ghost"
						size="sm"
						className="ms-auto hidden @sm/dashboard:inline-flex"
						target="_blank"
						rel="noreferrer"
					>
						GitHub
					</Button>
				</header>
				<div className="grid min-w-0 gap-4 p-3 @md/dashboard:p-5">
					<output className="text-xs text-muted-foreground" role="status">
						{message ||
							t(
								"Sample workspace · changes stay in this preview.",
								"示例工作区 · 变更仅保留在本预览中。"
							)}
					</output>
					<div className="grid gap-3 @lg/dashboard:grid-cols-2 @5xl/dashboard:grid-cols-4">
						{metrics.map(([title, value, change, summary, description]) => (
							<Card key={title} className="min-w-0 bg-linear-to-t from-primary/5 to-card">
								<CardHeader>
									<CardDescription>{title}</CardDescription>
									<div className="flex flex-wrap items-center gap-2">
										<CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
										<Badge className="ms-auto" variant="outline">
											{change}
										</Badge>
									</div>
								</CardHeader>
								<CardFooter className="flex-col items-start gap-1 text-xs">
									<span className="font-medium">{summary}</span>
									<span className="text-muted-foreground">{description}</span>
								</CardFooter>
							</Card>
						))}
					</div>
					<Visitors t={t} chinese={chinese} />
					<Tabs value={view} onValueChange={setView} className="min-w-0 gap-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Choice
								value={view}
								options={views.map(([key, label]) => [key, label])}
								label={t("View", "视图")}
								onChange={setView}
								className="flex @3xl/dashboard:hidden"
							/>
							<TabsList
								aria-label={t("Document views", "文档视图")}
								variant="capsule"
								className="hidden @3xl/dashboard:flex"
							>
								{views.map(([key, label, count]) => (
									<TabsTrigger value={key} key={key}>
										{label}
										{count > 0 && <Badge variant="secondary">{count}</Badge>}
									</TabsTrigger>
								))}
							</TabsList>
							<div className="flex flex-wrap gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											{t("Customize Columns", "自定义列")}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent appearance="surface" align="end" className="min-w-36">
										{sectionFields.slice(1).map((field) => (
											<DropdownMenuCheckboxItem
												key={field}
												checked={!hidden.includes(field)}
												onSelect={(event) => event.preventDefault()}
												onCheckedChange={(checked) =>
													setHidden((list) =>
														checked ? list.filter((key) => key !== field) : [...list, field]
													)
												}
											>
												{fieldLabel(field)}
											</DropdownMenuCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
								<Button
									ref={addButton}
									variant="outline"
									size="sm"
									onClick={(event) => editRow(undefined, event.currentTarget)}
								>
									<span aria-hidden="true">＋</span> {t("Add Section", "添加章节")}
								</Button>
							</div>
						</div>
						<TabsContent value="outline" className="grid min-w-0 gap-3">
							<div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] bg-card">
								<Table scrollLabel={t("Scroll document outline", "滚动文档大纲")}>
									<TableCaption className="sr-only">
										{t("Document outline", "文档大纲")}
									</TableCaption>
									<TableHeader className="bg-muted">
										<TableRow>
											<TableHead scope="col">
												<span className="sr-only">{t("Reorder", "重新排序")}</span>
											</TableHead>
											<TableHead scope="col">
												<Checkbox
													aria-label={t("Select all", "全选本页")}
													disabled={!pageCount && !pageRows.length}
													checked={
														pageCount > 0 && (pageCount === pageRows.length || "indeterminate")
													}
													onCheckedChange={(checked) =>
														setSelected((list) => [
															...list.filter((key) => !pageIds.includes(key)),
															...(checked === true ? pageIds : []),
														])
													}
												/>
											</TableHead>
											{fields.map((field) => (
												<TableHead
													scope="col"
													key={field}
													className={
														field === "target" || field === "limit" ? "text-end" : undefined
													}
												>
													{fieldLabel(field)}
												</TableHead>
											))}
											<TableHead scope="col">
												<span className="sr-only">{t("Actions", "操作")}</span>
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{pageRows.map((row, index) => (
											<TableRow
												key={row.id}
												data-state={selected.includes(row.id) ? "selected" : undefined}
												className={dropTarget === row.id ? "bg-accent" : undefined}
												onDragOver={(event) => {
													if (drag.current !== null) {
														event.preventDefault();
														event.dataTransfer.dropEffect = "move";
														setDropTarget(row.id);
													}
												}}
												onDrop={(event) => {
													if (drag.current !== null) {
														event.preventDefault();
														moveRow(drag.current, row.id);
														drag.current = null;
														setDropTarget(null);
													}
												}}
											>
												<TableCell className="w-8">
													<Button
														variant="ghost"
														size="icon-sm"
														draggable
														aria-label={`${t("Reorder", "重新排序")} ${row.header}`}
														className="cursor-grab text-muted-foreground"
														onDragStart={(event) => {
															drag.current = row.id;
															event.dataTransfer.effectAllowed = "move";
															event.dataTransfer.setData("text/plain", String(row.id));
														}}
														onDragEnd={() => {
															drag.current = null;
															setDropTarget(null);
														}}
														onKeyDown={(event) => {
															if (event.key === "ArrowUp" || event.key === "ArrowDown") {
																event.preventDefault();
																const target = pageRows[index + (event.key === "ArrowUp" ? -1 : 1)];
																if (target) moveRow(row.id, target.id);
															}
														}}
													>
														<span aria-hidden="true">⠿</span>
													</Button>
												</TableCell>
												<TableCell className="w-8">
													<Checkbox
														aria-label={`${t("Select", "选择")} ${row.header}`}
														checked={selected.includes(row.id)}
														onCheckedChange={(checked) =>
															setSelected((list) =>
																checked === true
																	? [...list, row.id]
																	: list.filter((key) => key !== row.id)
															)
														}
													/>
												</TableCell>
												{fields.map((field) => (
													<TableCell
														key={field}
														className={
															field === "target" || field === "limit" ? "text-end" : undefined
														}
													>
														{field === "header" ? (
															<button
																type="button"
																className="max-w-56 truncate rounded-sm text-start underline-offset-4 hover:underline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
																onClick={(event) => editRow(row, event.currentTarget)}
															>
																{row.favorite && <span aria-hidden="true">★ </span>}
																{row.header}
															</button>
														) : field === "type" ? (
															<Badge variant="outline">{row.type}</Badge>
														) : field === "status" ? (
															<Badge variant="outline">
																<span
																	aria-hidden="true"
																	className={
																		row.status === "Done" ? "text-success" : "text-muted-foreground"
																	}
																>
																	{row.status === "Done" ? "✓" : "○"}
																</span>
																{statusLabel(row.status)}
															</Badge>
														) : field === "reviewer" ? (
															<Choice
																value={row.reviewer}
																label={t("Assign reviewer", "分配审阅者")}
																options={reviewers.map((name) => [name, name])}
																onChange={(reviewer) => updateRow(row.id, { reviewer })}
																className="w-36"
															/>
														) : (
															<form
																className="inline-flex"
																onSubmit={(event) => {
																	event.preventDefault();
																	const input = event.currentTarget.elements.namedItem(field);
																	if (input instanceof HTMLInputElement) input.blur();
																}}
															>
																<Input
																	name={field}
																	type="number"
																	min="0"
																	step="1"
																	required
																	defaultValue={row[field]}
																	key={`${row.id}-${row[field]}`}
																	aria-label={`${fieldLabel(field)}: ${row.header}`}
																	className="w-17 border-transparent bg-transparent px-2 text-end tabular-nums hover:border-border"
																	onBlur={(event) => {
																		if (
																			event.currentTarget.validity.valid &&
																			event.currentTarget.value !== row[field]
																		) {
																			updateRow(row.id, { [field]: event.currentTarget.value });
																			setMessage(`${t("Saved", "已保存")} · ${row.header}`);
																		} else event.currentTarget.value = row[field];
																	}}
																/>
															</form>
														)}
													</TableCell>
												))}
												<TableCell>
													<DropdownMenu modal={false}>
														<DropdownMenuTrigger asChild>
															<Button
																id={`${id}-row-${row.id}`}
																variant="ghost"
																size="icon-sm"
																aria-label={`${t("Open menu", "打开菜单")} · ${row.header}`}
															>
																<span aria-hidden="true">⋮</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															appearance="surface"
															align="end"
															onCloseAutoFocus={(event) => {
																if (draft) event.preventDefault();
															}}
														>
															<DropdownMenuItem
																onSelect={() =>
																	editRow(row, document.getElementById(`${id}-row-${row.id}`))
																}
															>
																{t("Edit", "编辑")}
															</DropdownMenuItem>
															<DropdownMenuItem
																onSelect={() => {
																	setRows([
																		...rows,
																		{
																			...row,
																			id: Math.max(...rows.map((item) => item.id)) + 1,
																			header: `${row.header} (${t("copy", "副本")})`,
																		},
																	]);
																	setMessage(`${t("Copied", "已复制")} · ${row.header}`);
																}}
															>
																{t("Make a copy", "制作副本")}
															</DropdownMenuItem>
															<DropdownMenuItem
																onSelect={() => updateRow(row.id, { favorite: !row.favorite })}
															>
																{row.favorite
																	? t("Remove favorite", "取消收藏")
																	: t("Favorite", "收藏")}
															</DropdownMenuItem>
															<DropdownMenuItem
																disabled={!index}
																onSelect={() => moveRow(row.id, pageRows[index - 1].id)}
															>
																{t("Move up", "上移")}
															</DropdownMenuItem>
															<DropdownMenuItem
																disabled={index === pageRows.length - 1}
																onSelect={() => moveRow(row.id, pageRows[index + 1].id)}
															>
																{t("Move down", "下移")}
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																variant="destructive"
																onSelect={() => {
																	deleteRow(row);
																	requestAnimationFrame(() => addButton.current?.focus());
																}}
															>
																{t("Delete", "删除")}
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
										{!pageRows.length && (
											<TableRow>
												<TableCell
													colSpan={fields.length + 3}
													className="h-24 text-center text-muted-foreground"
												>
													{t("No results.", "没有结果。")}
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
							<div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
								<span role="status" className="text-muted-foreground">
									{t(
										`${selected.length} of ${rows.length} row(s) selected.`,
										`已选中 ${selected.length} / ${rows.length} 行。`
									)}
								</span>
								<div className="flex flex-wrap items-center gap-2">
									<FieldLabel htmlFor={`${id}-page-size`}>
										{t("Rows per page", "每页行数")}
									</FieldLabel>
									<Choice
										id={`${id}-page-size`}
										label={t("Rows per page", "每页行数")}
										value={String(pageSize)}
										onChange={(value) => {
											setPageSize(Number(value));
											setPage(0);
										}}
										options={[10, 20, 30, 40, 50].map((size) => [String(size), String(size)])}
									/>
								</div>
								<div className="flex flex-wrap items-center gap-1">
									<span className="me-1">
										{t(
											`Page ${currentPage + 1} of ${pages}`,
											`第 ${currentPage + 1} / ${pages} 页`
										)}
									</span>
									{[
										["«", t("Go to first page", "首页"), 0],
										["‹", t("Go to previous page", "上一页"), currentPage - 1],
										["›", t("Go to next page", "下一页"), currentPage + 1],
										["»", t("Go to last page", "末页"), pages - 1],
									].map(([icon, label, target]) => (
										<Button
											key={label}
											variant="outline"
											size="icon-sm"
											aria-label={String(label)}
											disabled={
												target === currentPage || Number(target) < 0 || Number(target) >= pages
											}
											onClick={() => setPage(Number(target))}
										>
											<span aria-hidden="true">{icon}</span>
										</Button>
									))}
								</div>
							</div>
						</TabsContent>
						{views.slice(1).map(([key, label]) => (
							<TabsContent key={key} value={key}>
								<div className="grid min-h-40 place-content-center gap-1 rounded-lg border border-dashed p-4 text-center">
									<h2 className="text-sm font-medium">{label}</h2>
									<p className="text-xs text-muted-foreground">
										{t("No sample content for this view.", "此视图暂无示例内容。")}
									</p>
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>
			</SidebarInset>
			<Drawer
				open={draft !== null}
				onOpenChange={(open) => {
					if (!open) setDraft(null);
				}}
				direction={drawerDirection}
				shouldScaleBackground={false}
			>
				<DrawerContent
					className="max-h-dvh! gap-2 pb-4"
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						(opener.current?.isConnected
							? opener.current
							: (addButton.current ?? boundary.current)
						)?.focus();
					}}
				>
					<DrawerHeader>
						<DrawerTitle>
							{draft?.id ? t("Edit section", "编辑章节") : t("Add Section", "添加章节")}
						</DrawerTitle>
						<DrawerDescription>
							{t("Edits are saved in this preview only.", "编辑仅保存在此预览中。")}
						</DrawerDescription>
					</DrawerHeader>
					{draft && (
						<form
							id={`${id}-section-form`}
							className="grid min-h-0 gap-3 overflow-y-auto px-4 py-1"
							onSubmit={(event) => {
								event.preventDefault();
								saveRow();
							}}
						>
							{sectionFields.map((field) => (
								<Field key={field}>
									<FieldLabel htmlFor={`${id}-${field}`}>{fieldLabel(field)}</FieldLabel>
									{field === "type" || field === "status" || field === "reviewer" ? (
										<NativeSelect
											id={`${id}-${field}`}
											className="w-full"
											value={draft[field]}
											onChange={(event) =>
												setDraft({ ...draft, [field]: event.currentTarget.value })
											}
										>
											{field === "reviewer" && (
												<NativeSelectOption value="">
													{t("Unassigned", "未分配")}
												</NativeSelectOption>
											)}
											{(field === "type"
												? sectionTypes
												: field === "status"
													? statuses
													: reviewers
											).map((value) => (
												<NativeSelectOption value={value} key={value}>
													{field === "status" ? statusLabel(value) : value}
												</NativeSelectOption>
											))}
										</NativeSelect>
									) : (
										<Input
											id={`${id}-${field}`}
											value={draft[field]}
											required
											maxLength={field === "header" ? 100 : undefined}
											min={field === "header" ? undefined : 0}
											type={field === "header" ? "text" : "number"}
											onChange={(event) =>
												setDraft({ ...draft, [field]: event.currentTarget.value })
											}
										/>
									)}
								</Field>
							))}
						</form>
					)}
					<DrawerFooter className="mt-0 flex-row! justify-end">
						<Button type="submit" form={`${id}-section-form`} disabled={!draft?.header.trim()}>
							{t("Submit", "提交")}
						</Button>
						<DrawerClose asChild>
							<Button variant="outline">{t("Done", "完成")}</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</SidebarProvider>
	);
}
