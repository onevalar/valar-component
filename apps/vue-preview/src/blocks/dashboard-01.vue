<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
import { Button } from "@valar/vue-ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@valar/vue-ui/card";
import { Checkbox } from "@valar/vue-ui/checkbox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@valar/vue-ui/drawer";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import { Field, FieldLabel } from "@valar/vue-ui/field";
import { Input } from "@valar/vue-ui/input";
import { NativeSelect, NativeSelectOption } from "@valar/vue-ui/native-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/vue-ui/select";
import { Separator } from "@valar/vue-ui/separator";
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
} from "@valar/vue-ui/sidebar";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/vue-ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/vue-ui/tabs";
import { computed, ref, shallowRef, useId } from "vue";

// Adapted from the Valar Svelte dashboard-01 registry block (see repository LICENSE.md).
// Sample state only: no routing, persistence, analytics, sharing, or authentication backend.
const props = defineProps<{ chinese?: boolean }>();
const t = (english: string, chinese: string) => (props.chinese ? chinese : english);
const id = useId();
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
const rows = ref<Section[]>(
	[
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
	}))
);

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
const ranges = computed(
	() =>
		[
			["90", t("Last 3 months", "最近 3 个月")],
			["30", t("Last 30 days", "最近 30 天")],
			["7", t("Last 7 days", "最近 7 天")],
		] as const
);
const range = ref("90");
const cursor = ref<number | null>(null);
const data = computed(() => visitors.slice(-Number(range.value) - 1));
const current = computed(() => (cursor.value === null ? null : data.value[cursor.value]));
const formatDate = computed(
	() =>
		new Intl.DateTimeFormat(props.chinese ? "zh-CN" : "en-US", {
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		})
);
const x = (i: number) => (800 * i) / (data.value.length - 1);
const y = (value: number) => 172 - (value / 1200) * 172;
const line = (getValue: (row: (typeof visitors)[number]) => number) =>
	data.value.map((row, i) => `${x(i)},${y(getValue(row))}`).join(" ");
const total = computed(() => line((row) => row.desktop + row.mobile));
const lower = computed(() => line((row) => row.mobile));
const chartReadout = computed(() =>
	current.value
		? `${formatDate.value.format(current.value.date)} · ${t("Desktop", "桌面端")} ${current.value.desktop} · ${t("Mobile", "移动端")} ${current.value.mobile}`
		: ""
);

function moveCursor(event: PointerEvent) {
	if (!(event.currentTarget instanceof SVGSVGElement)) return;
	const box = event.currentTarget.getBoundingClientRect();
	cursor.value = Math.max(
		0,
		Math.min(
			data.value.length - 1,
			Math.round(((event.clientX - box.left) / box.width) * (data.value.length - 1))
		)
	);
}
function leaveChart(event: PointerEvent) {
	if (document.activeElement !== event.currentTarget) cursor.value = null;
}
function chartKeys(event: KeyboardEvent) {
	if (
		event.key !== "ArrowLeft" &&
		event.key !== "ArrowRight" &&
		event.key !== "Home" &&
		event.key !== "End"
	)
		return;
	event.preventDefault();
	cursor.value =
		event.key === "Home"
			? 0
			: event.key === "End"
				? data.value.length - 1
				: Math.max(
						0,
						Math.min(
							data.value.length - 1,
							(cursor.value ?? 0) + (event.key === "ArrowLeft" ? -1 : 1)
						)
					);
}

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
const fieldLabel = (field: SectionField) => t(fieldLabels[field][0], fieldLabels[field][1]);
const drawerFields = computed(() => sectionFields);
const hideableFields = computed(() => sectionFields.slice(1));
const selected = ref<number[]>([]);
const hidden = ref<SectionField[]>([]);
const view = ref("outline");
const page = ref(0);
const pageSize = ref(10);
const activeNav = ref("Dashboard");
const documents = ref(["Data Library", "Reports", "Word Assistant"]);
const draft = ref<Section | null>(null);
const message = ref("");
const drag = ref<number | null>(null);
const dropTarget = ref<number | null>(null);
const drawerDirection = ref<"bottom" | "right">("right");
const opener = shallowRef<HTMLElement | null>(null);
const boundary = ref<HTMLHeadingElement>();
const pages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize.value)));
const currentPage = computed(() => Math.min(page.value, pages.value - 1));
const pageRows = computed(() =>
	rows.value.slice(currentPage.value * pageSize.value, (currentPage.value + 1) * pageSize.value)
);
const pageIds = computed(() => pageRows.value.map((row) => row.id));
const pageCount = computed(
	() => pageIds.value.filter((key) => selected.value.includes(key)).length
);
const fields = computed(() => sectionFields.filter((field) => !hidden.value.includes(field)));
const metrics = computed(() => [
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
]);
const views = computed(
	() =>
		[
			["outline", t("Outline", "大纲"), 0],
			["past-performance", t("Past Performance", "历史业绩"), 3],
			["key-personnel", t("Key Personnel", "核心人员"), 2],
			["focus-documents", t("Focus Documents", "重点文档"), 0],
		] as const
);
const navGroups = [
	[
		["Dashboard", "仪表板", "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
		["Lifecycle", "生命周期", "M3 6h18M3 12h18M3 18h18"],
		["Analytics", "分析", "M4 20V4m0 16h16m-12-4v-5m5 5V7m5 9V4"],
		["Projects", "项目", "M3 6h7l2 2h9v11H3z"],
		["Team", "团队", "M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"],
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
const reviewerOptions = computed(() => reviewers.map((name) => [name, name] as const));
function fieldOptions(
	field: "type" | "status" | "reviewer"
): ReadonlyArray<readonly [string, string]> {
	if (field === "type") return sectionTypes.map((name) => [name, name]);
	if (field === "status") return statuses.map((name) => [name, statusLabel(name)]);
	return [["", t("Unassigned", "未分配")], ...reviewerOptions.value];
}
function localAction(label: string) {
	message.value = `${label} · ${t("Preview only; no service connected.", "仅供预览；未连接服务。")}`;
}
function updateRow(key: number, update: Partial<Section>) {
	rows.value = rows.value.map((row) => (row.id === key ? { ...row, ...update } : row));
}
function moveRow(from: number, to: number | undefined) {
	const fromIndex = rows.value.findIndex((row) => row.id === from);
	const toIndex = rows.value.findIndex((row) => row.id === to);
	if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
	const [row] = rows.value.splice(fromIndex, 1);
	rows.value.splice(toIndex, 0, row);
	message.value = `${row.header} · ${t("Moved to position", "移至位置")} ${toIndex + 1}`;
}
function dragStart(event: DragEvent, key: number) {
	if (!event.dataTransfer) return;
	drag.value = key;
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("text/plain", String(key));
}
function dragOver(event: DragEvent, key: number) {
	if (drag.value === null || !event.dataTransfer) return;
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
	dropTarget.value = key;
}
function dragEnd() {
	drag.value = null;
	dropTarget.value = null;
}
function drop(event: DragEvent, key: number) {
	if (drag.value === null) return;
	event.preventDefault();
	moveRow(drag.value, key);
	dragEnd();
}
function editRow(row: Section | undefined, source: EventTarget | null) {
	opener.value = source instanceof HTMLElement ? source : null;
	drawerDirection.value = window.matchMedia("(width < 48rem)").matches ? "bottom" : "right";
	draft.value = row
		? { ...row }
		: {
				id: 0,
				header: "",
				type: sectionTypes[2],
				status: statuses[2],
				target: "0",
				limit: "0",
				reviewer: "",
			};
}
const addButton = () => document.getElementById(`${id}-add`);
function editFromMenu(row: Section) {
	editRow(row, document.getElementById(`${id}-row-${row.id}`));
}
function restoreFocus(event: Event) {
	event.preventDefault();
	(opener.value?.isConnected ? opener.value : (addButton() ?? boundary.value))?.focus();
}
function saveRow() {
	if (!draft.value?.header.trim()) return;
	const next = { ...draft.value, header: draft.value.header.trim() };
	if (next.id) updateRow(next.id, next);
	else {
		next.id = Math.max(0, ...rows.value.map((row) => row.id)) + 1;
		page.value = Math.floor(rows.value.length / pageSize.value);
		rows.value.push(next);
		view.value = "outline";
	}
	message.value = `${t("Saved", "已保存")} · ${next.header}`;
	draft.value = null;
}
function editNumber(event: FocusEvent, row: Section, field: "target" | "limit") {
	const input = event.currentTarget;
	if (!(input instanceof HTMLInputElement)) return;
	if (input.validity.valid && input.value !== row[field]) {
		updateRow(row.id, { [field]: input.value });
		message.value = `${t("Saved", "已保存")} · ${row.header}`;
	} else input.value = row[field];
}
function submitNumber(event: SubmitEvent, field: "target" | "limit") {
	const form = event.currentTarget;
	if (!(form instanceof HTMLFormElement)) return;
	const input = form.elements.namedItem(field);
	if (input instanceof HTMLInputElement) input.blur();
}
function copyRow(row: Section) {
	rows.value.push({
		...row,
		id: Math.max(...rows.value.map((item) => item.id)) + 1,
		header: `${row.header} (${t("copy", "副本")})`,
	});
	message.value = `${t("Copied", "已复制")} · ${row.header}`;
}
function deleteRow(row: Section) {
	rows.value = rows.value.filter(({ id }) => id !== row.id);
	selected.value = selected.value.filter((key) => key !== row.id);
	page.value = currentPage.value;
	message.value = `${t("Deleted", "已删除")} · ${row.header}`;
	requestAnimationFrame(() => addButton()?.focus());
}
</script>

<template>
	<SidebarProvider :persist-state="false" class="relative min-w-0 overflow-hidden">
		<Sidebar
			:id="`${id}-nav`"
			variant="inset"
			:mobile-title="t('Dashboard navigation', '仪表板导航')"
			:mobile-description="t('Navigate sample documents and reports.', '浏览示例文档及报告。')"
			class="md:absolute md:h-full"
		>
			<SidebarHeader
				><span class="px-2 py-1 text-base font-semibold">Acme Inc.</span></SidebarHeader
			>
			<SidebarContent>
				<SidebarGroup
					v-for="(group, groupIndex) in navGroups"
					:key="groupIndex"
					:class="groupIndex === 1 ? 'order-last mt-auto' : 'gap-2'"
				>
					<div v-if="groupIndex === 0" class="flex gap-2 px-1">
						<Button class="grow" size="sm" @click="editRow(undefined, $event.currentTarget)"
							><span aria-hidden="true">＋</span> {{ t("Quick Create", "快速创建") }}</Button
						>
						<Button
							variant="outline"
							size="icon-sm"
							:aria-label="t('Inbox', '收件箱')"
							@click="localAction(t('Inbox', '收件箱'))"
							><span aria-hidden="true">✉</span></Button
						>
					</div>
					<SidebarMenu
						><SidebarMenuItem v-for="[label, translation, path] in group" :key="label">
							<SidebarMenuButton
								:is-active="activeNav === label"
								@click="
									activeNav = label;
									label === 'Dashboard' ? (message = '') : localAction(t(label, translation));
								"
							>
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.75"
								>
									<path :d="path" /></svg
								><span>{{ t(label, translation) }}</span>
							</SidebarMenuButton>
						</SidebarMenuItem></SidebarMenu
					>
				</SidebarGroup>
				<SidebarGroup
					><SidebarGroupLabel>{{ t("Documents", "文档") }}</SidebarGroupLabel
					><SidebarMenu>
						<SidebarMenuItem v-for="item in documents" :key="item">
							<SidebarMenuButton class="pe-9" @click="localAction(t(item, docNames[item]))"
								><span>{{ t(item, docNames[item]) }}</span></SidebarMenuButton
							>
							<DropdownMenu
								><DropdownMenuTrigger as-child
									><SidebarMenuAction
										:aria-label="`${t('More options for', '更多选项：')} ${t(item, docNames[item])}`"
										><span aria-hidden="true">⋯</span></SidebarMenuAction
									></DropdownMenuTrigger
								>
								<DropdownMenuContent appearance="surface" align="end">
									<DropdownMenuItem @select="localAction(t(item, docNames[item]))">{{
										t("Open", "打开")
									}}</DropdownMenuItem>
									<DropdownMenuItem @select="localAction(t('Share', '分享'))">{{
										t("Share", "分享")
									}}</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										@select="
											documents = documents.filter((name) => name !== item);
											message = `${t('Removed', '已移除')} · ${t(item, docNames[item])}`;
										"
										>{{ t("Delete", "删除") }}</DropdownMenuItem
									>
								</DropdownMenuContent></DropdownMenu
							>
						</SidebarMenuItem>
						<SidebarMenuItem
							><SidebarMenuButton @click="localAction(t('More documents', '更多文档'))">{{
								t("More", "更多")
							}}</SidebarMenuButton></SidebarMenuItem
						>
					</SidebarMenu></SidebarGroup
				>
			</SidebarContent>
			<SidebarFooter
				><SidebarMenu
					><SidebarMenuItem>
						<DropdownMenu
							><DropdownMenuTrigger as-child
								><SidebarMenuButton size="lg"
									><span
										class="grid size-7 place-items-center rounded-md bg-muted"
										aria-hidden="true"
										>V</span
									><span class="grid text-start"
										>Valar <small class="text-muted-foreground">m@example.com</small></span
									><span class="ms-auto" aria-hidden="true">⋮</span></SidebarMenuButton
								></DropdownMenuTrigger
							>
							<DropdownMenuContent appearance="surface" align="end">
								<DropdownMenuItem
									v-for="[label, translation] in [
										['Account', '账户'],
										['Billing', '账单'],
										['Notifications', '通知'],
										['Log out', '退出登录'],
									]"
									:key="label"
									@select="localAction(t(label, translation))"
									>{{ t(label, translation) }}</DropdownMenuItem
								>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem></SidebarMenu
				></SidebarFooter
			>
		</Sidebar>
		<SidebarInset class="@container/dashboard min-w-0">
			<header class="flex min-h-12 flex-wrap items-center gap-2 border-b px-4">
				<SidebarTrigger :label="t('Toggle Sidebar', '切换侧栏')" :aria-controls="`${id}-nav`" />
				<Separator orientation="vertical" class="h-4! self-auto!" />
				<h1
					ref="boundary"
					tabindex="-1"
					class="text-base font-medium focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
				>
					{{ t("Documents", "文档") }}
				</h1>
				<Button
					as="a"
					href="https://github.com/onevalar/valar-component/tree/main/docs/src/lib/registry/blocks/dashboard-01"
					variant="ghost"
					size="sm"
					class="ms-auto hidden @sm/dashboard:inline-flex"
					target="_blank"
					rel="noreferrer"
					>GitHub</Button
				>
			</header>
			<div class="grid min-w-0 gap-4 p-3 @md/dashboard:p-5">
				<output class="text-xs text-muted-foreground" role="status">{{
					message ||
					t(
						"Sample workspace · changes stay in this preview.",
						"示例工作区 · 变更仅保留在本预览中。"
					)
				}}</output>
				<div class="grid gap-3 @lg/dashboard:grid-cols-2 @5xl/dashboard:grid-cols-4">
					<Card
						v-for="[title, value, change, summary, description] in metrics"
						:key="title"
						class="min-w-0 bg-linear-to-t from-primary/5 to-card"
					>
						<CardHeader
							><CardDescription>{{ title }}</CardDescription>
							<div class="flex flex-wrap items-center gap-2">
								<CardTitle class="text-2xl tabular-nums">{{ value }}</CardTitle
								><Badge class="ms-auto" variant="outline">{{ change }}</Badge>
							</div></CardHeader
						>
						<CardFooter class="flex-col items-start gap-1 text-xs"
							><span class="font-medium">{{ summary }}</span
							><span class="text-muted-foreground">{{ description }}</span></CardFooter
						>
					</Card>
				</div>
				<Card class="min-w-0">
					<CardHeader
						><div class="flex flex-wrap items-center justify-between gap-2">
							<div>
								<CardTitle>{{ t("Total Visitors", "访客总数") }}</CardTitle
								><CardDescription>{{ ranges.find(([key]) => key === range)?.[1] }}</CardDescription>
							</div>
							<Select
								:model-value="range"
								@update:model-value="
									range = String($event);
									cursor = null;
								"
								><SelectTrigger size="sm" :aria-label="t('Visitor date range', '访客日期范围')"
									><SelectValue /></SelectTrigger
								><SelectContent
									><SelectItem v-for="[key, label] in ranges" :key="key" :value="key">{{
										label
									}}</SelectItem></SelectContent
								></Select
							>
						</div></CardHeader
					>
					<CardContent class="grid gap-2">
						<div
							class="relative rounded-lg focus-within:outline-1 focus-within:-outline-offset-1 focus-within:outline-ring"
						>
							<svg
								role="img"
								:aria-label="
									t(
										'Desktop and mobile visitors. Use arrow keys to read daily values.',
										'桌面端及移动端访客数。使用方向键查看每日数据。'
									)
								"
								tabindex="0"
								viewBox="0 0 800 176"
								preserveAspectRatio="none"
								class="h-44 w-full rounded-lg outline-none"
								@focus="cursor ??= data.length - 1"
								@blur="cursor = null"
								@pointermove="moveCursor"
								@pointerleave="leaveChart"
								@keydown="chartKeys"
							>
								<path
									v-for="mark in [25, 74, 123, 172]"
									:key="mark"
									:d="`M0 ${mark}H800`"
									stroke="var(--border)"
									vector-effect="non-scaling-stroke"
								/>
								<polygon
									:points="`0,172 ${total} 800,172`"
									fill="var(--chart-1)"
									fill-opacity="0.25"
								/>
								<polygon
									:points="`0,172 ${lower} 800,172`"
									fill="var(--chart-2)"
									fill-opacity="0.5"
								/>
								<polyline
									:points="total"
									fill="none"
									stroke="var(--chart-1)"
									vector-effect="non-scaling-stroke"
								/>
								<polyline
									:points="lower"
									fill="none"
									stroke="var(--chart-2)"
									vector-effect="non-scaling-stroke"
								/>
								<path
									v-if="cursor !== null"
									:d="`M${x(cursor)} 0V172`"
									stroke="var(--foreground)"
									stroke-dasharray="3 3"
									vector-effect="non-scaling-stroke"
								/>
							</svg>
							<div
								v-if="current"
								aria-hidden="true"
								class="cn-chart-tooltip pointer-events-none absolute top-1"
								:class="cursor !== null && cursor >= data.length / 2 ? 'start-1' : 'end-1'"
							>
								{{ chartReadout }}
							</div>
							<p class="sr-only" aria-live="polite">{{ chartReadout }}</p>
						</div>
						<div class="flex justify-between text-xs text-muted-foreground tabular-nums">
							<span
								v-for="index in [0, Math.floor((data.length - 1) / 2), data.length - 1]"
								:key="index"
								>{{ formatDate.format(data[index].date) }}</span
							>
						</div>
						<div class="flex justify-center gap-4 text-xs text-muted-foreground">
							<span
								><span class="me-1 inline-block size-2 rounded-sm bg-chart-1" />{{
									t("Desktop", "桌面端")
								}}</span
							><span
								><span class="me-1 inline-block size-2 rounded-sm bg-chart-2" />{{
									t("Mobile", "移动端")
								}}</span
							>
						</div>
					</CardContent>
				</Card>
				<Tabs :model-value="view" @update:model-value="view = String($event)" class="min-w-0 gap-3">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<Select :model-value="view" @update:model-value="view = String($event)"
							><SelectTrigger
								size="sm"
								:aria-label="t('View', '视图')"
								class="flex @3xl/dashboard:hidden"
								><SelectValue /></SelectTrigger
							><SelectContent
								><SelectItem v-for="[key, label] in views" :key="key" :value="key">{{
									label
								}}</SelectItem></SelectContent
							></Select
						>
						<TabsList
							:aria-label="t('Document views', '文档视图')"
							variant="capsule"
							class="hidden @3xl/dashboard:flex"
						>
							<TabsTrigger v-for="[key, label, count] in views" :key="key" :value="key"
								>{{ label }}<Badge v-if="count" variant="secondary">{{ count }}</Badge></TabsTrigger
							>
						</TabsList>
						<div class="flex flex-wrap gap-2">
							<DropdownMenu
								><DropdownMenuTrigger as-child
									><Button variant="outline" size="sm">{{
										t("Customize Columns", "自定义列")
									}}</Button></DropdownMenuTrigger
								>
								<DropdownMenuContent appearance="surface" align="end" class="min-w-36">
									<DropdownMenuCheckboxItem
										v-for="field in hideableFields"
										:key="field"
										:model-value="!hidden.includes(field)"
										@select.prevent
										@update:model-value="
											hidden = $event ? hidden.filter((key) => key !== field) : [...hidden, field]
										"
										>{{ fieldLabel(field) }}</DropdownMenuCheckboxItem
									>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								:id="`${id}-add`"
								variant="outline"
								size="sm"
								@click="editRow(undefined, $event.currentTarget)"
								><span aria-hidden="true">＋</span> {{ t("Add Section", "添加章节") }}</Button
							>
						</div>
					</div>
					<TabsContent value="outline" class="grid min-w-0 gap-3">
						<div class="min-w-0 overflow-hidden rounded-lg border-[0.5px] bg-card">
							<Table :scroll-label="t('Scroll document outline', '滚动文档大纲')">
								<TableCaption class="sr-only">{{ t("Document outline", "文档大纲") }}</TableCaption>
								<TableHeader class="bg-muted"
									><TableRow>
										<TableHead scope="col"
											><span class="sr-only">{{ t("Reorder", "重新排序") }}</span></TableHead
										>
										<TableHead scope="col"
											><Checkbox
												:aria-label="t('Select all', '全选本页')"
												:disabled="!pageRows.length"
												:model-value="
													pageCount > 0 && (pageCount === pageRows.length || 'indeterminate')
												"
												@update:model-value="
													selected = [
														...selected.filter((key) => !pageIds.includes(key)),
														...($event === true ? pageIds : []),
													]
												"
										/></TableHead>
										<TableHead
											v-for="field in fields"
											:key="field"
											scope="col"
											:class="field === 'target' || field === 'limit' ? 'text-end' : undefined"
											>{{ fieldLabel(field) }}</TableHead
										>
										<TableHead scope="col"
											><span class="sr-only">{{ t("Actions", "操作") }}</span></TableHead
										>
									</TableRow></TableHeader
								>
								<TableBody>
									<TableRow
										v-for="(row, index) in pageRows"
										:key="row.id"
										:data-state="selected.includes(row.id) ? 'selected' : undefined"
										:class="dropTarget === row.id ? 'bg-accent' : undefined"
										@dragover="dragOver($event, row.id)"
										@drop="drop($event, row.id)"
									>
										<TableCell class="w-8"
											><Button
												variant="ghost"
												size="icon-sm"
												draggable="true"
												:aria-label="`${t('Reorder', '重新排序')} ${row.header}`"
												class="cursor-grab text-muted-foreground"
												@dragstart="dragStart($event, row.id)"
												@dragend="dragEnd"
												@keydown.up.prevent="moveRow(row.id, pageRows[index - 1]?.id)"
												@keydown.down.prevent="moveRow(row.id, pageRows[index + 1]?.id)"
												><span aria-hidden="true">⠿</span></Button
											></TableCell
										>
										<TableCell class="w-8"
											><Checkbox
												:aria-label="`${t('Select', '选择')} ${row.header}`"
												:model-value="selected.includes(row.id)"
												@update:model-value="
													selected =
														$event === true
															? [...selected, row.id]
															: selected.filter((key) => key !== row.id)
												"
										/></TableCell>
										<TableCell
											v-for="field in fields"
											:key="field"
											:class="field === 'target' || field === 'limit' ? 'text-end' : undefined"
										>
											<button
												v-if="field === 'header'"
												type="button"
												class="max-w-56 truncate rounded-sm text-start underline-offset-4 hover:underline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
												@click="editRow(row, $event.currentTarget)"
											>
												<span v-if="row.favorite" aria-hidden="true">★ </span>{{ row.header }}
											</button>
											<Badge v-else-if="field === 'type'" variant="outline">{{ row.type }}</Badge>
											<Badge v-else-if="field === 'status'" variant="outline"
												><span
													aria-hidden="true"
													:class="row.status === 'Done' ? 'text-success' : 'text-muted-foreground'"
													>{{ row.status === "Done" ? "✓" : "○" }}</span
												>{{ statusLabel(row.status) }}</Badge
											>
											<Select
												v-else-if="field === 'reviewer'"
												:model-value="row.reviewer || undefined"
												@update:model-value="updateRow(row.id, { reviewer: String($event) })"
											>
												<SelectTrigger
													size="sm"
													:aria-label="t('Assign reviewer', '分配审阅者')"
													class="w-36"
													><span data-slot="select-value">{{
														row.reviewer || t("Assign reviewer", "分配审阅者")
													}}</span></SelectTrigger
												><SelectContent
													><SelectItem
														v-for="[reviewer] in reviewerOptions"
														:key="reviewer"
														:value="reviewer"
														>{{ reviewer }}</SelectItem
													></SelectContent
												>
											</Select>
											<form
												v-else
												class="inline-flex"
												@submit.prevent="submitNumber($event, field)"
											>
												<Input
													:key="`${row.id}-${row[field]}`"
													:name="field"
													type="number"
													min="0"
													step="1"
													required
													:default-value="row[field]"
													:aria-label="`${fieldLabel(field)}: ${row.header}`"
													class="w-17 border-transparent bg-transparent px-2 text-end tabular-nums hover:border-border"
													@blur="editNumber($event, row, field)"
												/>
											</form>
										</TableCell>
										<TableCell
											><DropdownMenu :modal="false"
												><DropdownMenuTrigger as-child
													><Button
														:id="`${id}-row-${row.id}`"
														variant="ghost"
														size="icon-sm"
														:aria-label="`${t('Open menu', '打开菜单')} · ${row.header}`"
														><span aria-hidden="true">⋮</span></Button
													></DropdownMenuTrigger
												>
												<DropdownMenuContent
													appearance="surface"
													align="end"
													@close-auto-focus="
														(event: Event) => {
															if (draft) event.preventDefault();
														}
													"
												>
													<DropdownMenuItem @select="editFromMenu(row)">{{
														t("Edit", "编辑")
													}}</DropdownMenuItem>
													<DropdownMenuItem @select="copyRow(row)">{{
														t("Make a copy", "制作副本")
													}}</DropdownMenuItem>
													<DropdownMenuItem
														@select="updateRow(row.id, { favorite: !row.favorite })"
														>{{
															row.favorite
																? t("Remove favorite", "取消收藏")
																: t("Favorite", "收藏")
														}}</DropdownMenuItem
													>
													<DropdownMenuItem
														:disabled="index === 0"
														@select="moveRow(row.id, pageRows[index - 1]?.id)"
														>{{ t("Move up", "上移") }}</DropdownMenuItem
													>
													<DropdownMenuItem
														:disabled="index === pageRows.length - 1"
														@select="moveRow(row.id, pageRows[index + 1]?.id)"
														>{{ t("Move down", "下移") }}</DropdownMenuItem
													>
													<DropdownMenuSeparator /><DropdownMenuItem
														variant="destructive"
														@select="deleteRow(row)"
														>{{ t("Delete", "删除") }}</DropdownMenuItem
													>
												</DropdownMenuContent>
											</DropdownMenu></TableCell
										>
									</TableRow>
									<TableRow v-if="!pageRows.length"
										><TableCell
											:colspan="fields.length + 3"
											class="h-24 text-center text-muted-foreground"
											>{{ t("No results.", "没有结果。") }}</TableCell
										></TableRow
									>
								</TableBody>
							</Table>
						</div>
						<div class="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
							<span role="status" class="text-muted-foreground">{{
								t(
									`${selected.length} of ${rows.length} row(s) selected.`,
									`已选中 ${selected.length} / ${rows.length} 行。`
								)
							}}</span>
							<div class="flex flex-wrap items-center gap-2">
								<FieldLabel :for="`${id}-page-size`">{{
									t("Rows per page", "每页行数")
								}}</FieldLabel>
								<Select
									:model-value="String(pageSize)"
									@update:model-value="
										pageSize = Number($event);
										page = 0;
									"
									><SelectTrigger :id="`${id}-page-size`" size="sm"><SelectValue /></SelectTrigger
									><SelectContent side="top"
										><SelectItem
											v-for="size in [10, 20, 30, 40, 50]"
											:key="size"
											:value="String(size)"
											>{{ size }}</SelectItem
										></SelectContent
									></Select
								>
							</div>
							<div class="flex flex-wrap items-center gap-1">
								<span class="me-1">{{
									t(`Page ${currentPage + 1} of ${pages}`, `第 ${currentPage + 1} / ${pages} 页`)
								}}</span>
								<Button
									v-for="[icon, label, target] in [
										['«', t('Go to first page', '首页'), 0],
										['‹', t('Go to previous page', '上一页'), currentPage - 1],
										['›', t('Go to next page', '下一页'), currentPage + 1],
										['»', t('Go to last page', '末页'), pages - 1],
									]"
									:key="label"
									variant="outline"
									size="icon-sm"
									:aria-label="String(label)"
									:disabled="
										target === currentPage || Number(target) < 0 || Number(target) >= pages
									"
									@click="page = Number(target)"
									><span aria-hidden="true">{{ icon }}</span></Button
								>
							</div>
						</div>
					</TabsContent>
					<TabsContent v-for="[key, label] in views.slice(1)" :key="key" :value="key"
						><div
							class="grid min-h-40 place-content-center gap-1 rounded-lg border border-dashed p-4 text-center"
						>
							<h2 class="text-sm font-medium">{{ label }}</h2>
							<p class="text-xs text-muted-foreground">
								{{ t("No sample content for this view.", "此视图暂无示例内容。") }}
							</p>
						</div></TabsContent
					>
				</Tabs>
			</div>
		</SidebarInset>
		<Drawer
			:open="draft !== null"
			@update:open="
				(open) => {
					if (!open) draft = null;
				}
			"
			:direction="drawerDirection"
			:should-scale-background="false"
		>
			<DrawerContent class="max-h-dvh! gap-2 pb-4" @close-auto-focus="restoreFocus">
				<DrawerHeader
					><DrawerTitle>{{
						draft?.id ? t("Edit section", "编辑章节") : t("Add Section", "添加章节")
					}}</DrawerTitle
					><DrawerDescription>{{
						t("Edits are saved in this preview only.", "编辑仅保存在此预览中。")
					}}</DrawerDescription></DrawerHeader
				>
				<form v-if="draft" class="flex min-h-0 flex-col" @submit.prevent="saveRow">
					<div class="grid min-h-0 gap-3 overflow-y-auto px-4 py-1">
						<Field v-for="field in drawerFields" :key="field">
							<FieldLabel :for="`${id}-${field}`">{{ fieldLabel(field) }}</FieldLabel>
							<NativeSelect
								v-if="field === 'type' || field === 'status' || field === 'reviewer'"
								:id="`${id}-${field}`"
								v-model="draft[field]"
								class="w-full"
							>
								<NativeSelectOption
									v-for="[value, label] in fieldOptions(field)"
									:key="value"
									:value="value"
									>{{ label }}</NativeSelectOption
								>
							</NativeSelect>
							<Input
								v-else
								:id="`${id}-${field}`"
								:model-value="draft[field]"
								required
								:maxlength="field === 'header' ? 100 : undefined"
								:min="field === 'header' ? undefined : 0"
								:type="field === 'header' ? 'text' : 'number'"
								@update:model-value="draft && (draft[field] = String($event))"
							/>
						</Field>
					</div>
					<DrawerFooter class="mt-0 flex-row! justify-end"
						><Button type="submit" :disabled="!draft.header.trim()">{{
							t("Submit", "提交")
						}}</Button
						><DrawerClose as-child
							><Button type="button" variant="outline">{{ t("Done", "完成") }}</Button></DrawerClose
						></DrawerFooter
					>
				</form>
			</DrawerContent>
		</Drawer>
	</SidebarProvider>
</template>
