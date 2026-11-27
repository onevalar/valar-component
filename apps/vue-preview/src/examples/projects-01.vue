<script setup lang="ts">
// Standalone English preview of the Valar Projects scene; use with the Valar theme.
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@valar/vue-ui/alert-dialog";
import { Button } from "@valar/vue-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/vue-ui/collapsible";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/vue-ui/command";
import { DatePicker, dateLabel, timeframeEnd, type Timeframe } from "@valar/vue-ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@valar/vue-ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import { Input } from "@valar/vue-ui/input";
import { NativeSelect, NativeSelectOption } from "@valar/vue-ui/native-select";
import {
	PageLayout,
	PageLayoutHeader,
	PageLayoutTitle,
	PageLayoutToolbar,
} from "@valar/vue-ui/page-layout";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/vue-ui/popover";
import { Switch } from "@valar/vue-ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@valar/vue-ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/vue-ui/tabs";
import { Textarea } from "@valar/vue-ui/textarea";
import {
	computed,
	defineComponent,
	h,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	useId,
	watch,
	type PropType,
} from "vue";

const props = defineProps<{ empty?: boolean; singleTeam?: boolean }>();
const statuses = {
	backlog: "Backlog",
	planned: "Planned",
	active: "In Progress",
	completed: "Completed",
	canceled: "Canceled",
} as const;
const colors = {
	backlog: "border-dashed border-warning",
	planned: "border-muted-foreground",
	active: "border-warning bg-warning/30",
	completed: "border-success bg-success",
	canceled: "border-muted-foreground bg-muted-foreground/40",
};
const priorities = {
	urgent: "Urgent",
	high: "High",
	medium: "Medium",
	low: "Low",
	none: "No priority",
};
const teams = { design: "Design", engineering: "Engineering" };
const people = [
	{ id: "mira", team: "design", name: "Mira Chen", initials: "MC" },
	{ id: "alex", team: "engineering", name: "Alex Rivera", initials: "AR" },
];
const modes = { list: "List", board: "Board", timeline: "Timeline" };
const labels = {
	name: "Name",
	health: "Health",
	priority: "Priority",
	lead: "Lead",
	target: "Target date",
	issues: "Issues",
	status: "Status",
	team: "Lead team",
};
const fields = ["status", "priority", "lead", "team"] as const;
const columns = ["name", "health", "priority", "lead", "target", "issues", "status"] as const;
const orders = ["name", "priority", "target", "status"] as const;
const scales = {
	week: { label: "Week", pixels: 42, months: 2 },
	month: { label: "Month", pixels: 11, months: 6 },
	quarter: { label: "Quarter", pixels: 3.4, months: 18 },
	year: { label: "Year", pixels: 1.45, months: 36 },
} as const;
const scaleKeys = { w: "week", m: "month", q: "quarter", y: "year" } as const;
type Status = keyof typeof statuses;
type Scale = keyof typeof scales;
type Field = (typeof fields)[number];
type Order = (typeof orders)[number];
type Mode = keyof typeof modes;
type Milestone = { id: string; name: string; date: string; progress: number };
type Draft = {
	name: string;
	summary: string;
	description: string;
	status: Status;
	priority: keyof typeof priorities;
	teams: string[];
	lead: string;
	start?: Timeframe;
	target?: Timeframe;
};
type Project = Draft & { id: string; issues: number; progress: number; milestones?: Milestone[] };
type Graph = Partial<Record<string, string[]>>;
type Options = {
	view: Mode;
	filters: Partial<Record<Field, string[]>>;
	order?: Order;
	descending: boolean;
	scale: Scale;
	emptyColumns: boolean;
	projectList: boolean;
	weekNumbers: boolean;
	milestones: boolean;
	dependencies: boolean;
};
type SavedView = { id: string; name: string; options: Options };
type Choice = { id: string; label: string };
type Gesture = {
	id: string;
	pointer: number;
	element: HTMLElement;
	x: number;
	y: number;
	originX: number;
	originY: number;
	active: boolean;
	timer?: number;
	frame?: number;
};
const defaults: Options = {
	view: "list",
	filters: {},
	descending: false,
	scale: "month",
	emptyColumns: true,
	projectList: true,
	weekNumbers: false,
	milestones: true,
	dependencies: true,
};
const switches = {
	emptyColumns: "Show empty columns",
	projectList: "Show project list",
	weekNumbers: "Show week numbers",
	milestones: "Show milestones",
	dependencies: "Show dependencies",
} as const;
const modeSwitches = {
	list: [],
	board: ["emptyColumns"],
	timeline: ["projectList", "weekNumbers", "milestones", "dependencies"],
} as const;
const DAY = 86_400_000;
const ROW = 72;
const AXIS = 44;
const controlClass = "min-h-7 rounded-full text-xs";
const focusClass =
	"focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";
const monthLabel = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const entries = (record: Record<string, string>): Choice[] =>
	Object.entries(record).map(([id, label]) => ({ id, label }));
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY;
const iso = (value: number) => new Date(value * DAY).toISOString().slice(0, 10);
const monthOf = (value: number, offset = 0) => {
	const date = new Date(value * DAY);
	date.setUTCDate(1);
	date.setUTCMonth(date.getUTCMonth() + offset);
	return date.getTime() / DAY;
};
function stepDate(value: number, scale: Scale, direction: number) {
	if (scale === "week") return value + 7 * direction;
	const start = monthOf(value, direction * (scale === "month" ? 1 : scale === "quarter" ? 3 : 12));
	return Math.min(start + value - monthOf(value), monthOf(start, 1) - 1);
}
function emptyDraft(status: Status = "backlog", team = "design"): Draft {
	return {
		name: "",
		summary: "",
		description: "",
		status,
		priority: "none",
		teams: [team],
		lead: "",
	};
}
function samples(today: number): Project[] {
	return [
		{
			...emptyDraft(),
			id: "sample-1",
			name: "Component documentation",
			summary: "Align examples and usage notes.",
			issues: 0,
			progress: 0,
		},
		{
			...emptyDraft("backlog", "engineering"),
			id: "sample-2",
			name: "Preview performance",
			summary: "Reduce load time for component previews.",
			issues: 0,
			progress: 0,
			start: { date: iso(today - 9), grain: "day" },
			target: { date: iso(today + 26), grain: "day" },
			milestones: [
				{ id: "audit", name: "Baseline measurement", date: iso(today - 4), progress: 100 },
				{ id: "review", name: "Preview review", date: iso(today + 10), progress: 40 },
			],
		},
	];
}
function canAdd(graph: Graph, project: string, blocker: string) {
	const pending = [blocker];
	const visited = new Set<string>();
	for (const id of pending) {
		if (id === project) return false;
		if (visited.has(id)) continue;
		visited.add(id);
		pending.push(...(graph[id] ?? []));
	}
	return true;
}
function endpoints(blocker: Project, project: Project) {
	return blocker.target && project.start
		? { end: day(timeframeEnd(blocker.target)), start: day(project.start.date) }
		: undefined;
}
function conflict(blocker: Project, project: Project) {
	const dates = endpoints(blocker, project);
	return dates && dates.end > dates.start;
}
function visibleProjects(projects: Project[], options: Options) {
	const result = projects.filter((p) =>
		fields.every((field) => {
			const values = options.filters[field];
			return !values?.length || values.includes(field === "team" ? p.teams[0] : p[field]);
		})
	);
	return result.sort((a, b) => {
		const direction = options.descending ? -1 : 1;
		const rank = (record: Record<string, string>, left: string, right: string) =>
			Object.keys(record).indexOf(left) - Object.keys(record).indexOf(right);
		switch (options.order) {
			case "name":
				return direction * a.name.localeCompare(b.name);
			case "priority":
				return direction * rank(priorities, a.priority, b.priority);
			case "status":
				return direction * rank(statuses, a.status, b.status);
			case "target":
				return !a.target || !b.target
					? Number(!a.target) - Number(!b.target)
					: direction * a.target.date.localeCompare(b.target.date);
			default:
				return 0;
		}
	});
}
function savedView(value: unknown): value is SavedView {
	if (!value || typeof value !== "object") return false;
	const { id, name, options } = value as Partial<SavedView>;
	return (
		typeof id === "string" &&
		id !== "all" &&
		typeof name === "string" &&
		!!options &&
		Object.hasOwn(modes, options.view) &&
		Object.hasOwn(scales, options.scale) &&
		(!options.order || orders.includes(options.order)) &&
		typeof options.descending === "boolean" &&
		Object.keys(switches).every(
			(key) => typeof options[key as keyof typeof switches] === "boolean"
		) &&
		!!options.filters &&
		typeof options.filters === "object" &&
		fields.every((key) => {
			const values = options.filters[key];
			return (
				values === undefined ||
				(Array.isArray(values) && values.every((item) => typeof item === "string"))
			);
		})
	);
}

const StatusDot = defineComponent({
	props: { status: { type: String as PropType<Status>, required: true } },
	setup: (props) => () =>
		h("span", {
			"aria-hidden": "true",
			class: `inline-block size-3.5 shrink-0 rounded-full border ${colors[props.status]}`,
		}),
});
const ProjectIcon = defineComponent({
	setup: () => () =>
		h(
			"svg",
			{
				"aria-hidden": "true",
				class: "size-4 shrink-0 text-info",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": 1.25,
				"stroke-linejoin": "round",
			},
			[
				h("path", {
					d: "m8 1.5 5.6 3.25v6.5L8 14.5l-5.6-3.25v-6.5L8 1.5Zm5.6 3.25L8 8 2.4 4.75M8 8v6.5",
				}),
			]
		),
});
const choiceProps = {
	choices: { type: Array as PropType<Choice[]>, required: true },
	selected: Array as PropType<string[]>,
	search: { type: String, default: "Search values" },
	empty: { type: String, default: "No matching options" },
} as const;
const Choices = defineComponent({
	props: choiceProps,
	emits: { choose: (_id: string) => true },
	setup:
		(props, { emit }) =>
		() =>
			h(Command, { class: "bg-transparent", loop: true }, () => [
				h(CommandInput, { "aria-label": props.search, placeholder: `${props.search}…` }),
				h(CommandList, { class: "max-h-52 overflow-y-auto" }, () => [
					h(CommandEmpty, () => props.empty),
					...props.choices.map(({ id, label }) =>
						h(
							CommandItem,
							{
								key: id,
								value: `choice:${id}`,
								keywords: [label],
								"aria-current": props.selected?.includes(id) || undefined,
								onSelect: () => emit("choose", id),
							},
							() => [
								label,
								props.selected?.includes(id) &&
									h("span", { class: "ms-auto", "aria-hidden": "true" }, "✓"),
							]
						)
					),
				]),
			]),
});
function focusSearch(event: Event) {
	event.preventDefault();
	(event.target instanceof HTMLElement ? event.target : document.activeElement)
		?.querySelector("input")
		?.focus();
}
const Picker = defineComponent({
	props: {
		...choiceProps,
		label: { type: String, required: true },
		disabled: Boolean,
		portal: Object as PropType<HTMLElement>,
	},
	emits: { choose: (_id: string) => true },
	setup:
		(props, { emit, slots }) =>
		() =>
			h(Popover, {}, () => [
				h(PopoverTrigger, { asChild: true }, () =>
					h(
						Button,
						{
							type: "button",
							variant: "outline",
							size: "xs",
							"aria-label": props.label,
							disabled: props.disabled,
							class: controlClass,
						},
						slots.default
					)
				),
				h(
					PopoverContent,
					{
						"aria-label": props.label,
						appearance: "surface",
						align: "start",
						class: "w-60 gap-0 p-1.5",
						portalProps: props.portal ? { to: props.portal } : undefined,
						onOpenAutoFocus: focusSearch,
					},
					() =>
						h(Choices, {
							choices: props.choices,
							selected: props.selected,
							search: props.search,
							empty: props.empty,
							onChoose: (id) => emit("choose", id),
						})
				),
			]),
});

const id = useId();
const today = Math.floor(Date.now() / DAY);
const projects = ref<Project[]>(
	props.empty ? [] : samples(today).slice(0, props.singleTeam ? 1 : 2)
);
const options = ref<Options>(defaults);
const graph = ref<Graph>({});
const saved = ref<SavedView[]>([]);
const selectedView = ref("all");
const filterOpen = ref(false);
const filterField = ref<Field>();
const displayOpen = ref(false);
const saveOpen = ref(false);
const viewName = ref("");
const saveError = ref("");
const draft = ref<Draft>();
const initialStatus = ref<Status>("backlog");
const invalidName = ref(false);
const discardOpen = ref(false);
const draftPortal = ref<HTMLDivElement>();
const detailId = ref<string>();
const dragging = ref<string>();
const dropTarget = ref<Status>();
const announcement = ref("");
const anchor = ref(today);
const centerRequest = ref({ date: today });
const board = ref<HTMLDivElement>();
const scrollport = ref<HTMLDivElement>();
let draftOpener: HTMLElement | null = null;
let detailOpener: HTMLElement | null = null;
let discardOpener: HTMLElement | null = null;
let discardConfirmed = false;
let gesture: Gesture | null = null;
let skipClick: string | undefined;
let nextProject = 0;
const statusChoices = entries(statuses);
const priorityChoices = entries(priorities);
const teamChoices = computed(() => entries(teams).slice(0, props.singleTeam ? 1 : 2));
const choices = computed(() => ({
	status: statusChoices,
	priority: priorityChoices,
	team: teamChoices.value,
	lead: [
		{ id: "", label: "No lead" },
		...people
			.filter((p) => teamChoices.value.some((team) => team.id === p.team))
			.map((p) => ({ id: p.id, label: p.name })),
	],
}));
const storageKey = computed(
	() =>
		`valar.vue.projects.views.v1.${props.empty ? "empty" : props.singleTeam ? "single" : "sample"}`
);
const visible = computed(() => visibleProjects(projects.value, options.value));
const groups = computed(() =>
	statusChoices
		.map(({ id: key, label }) => {
			const status = key as Status;
			return { status, label, group: visible.value.filter((p) => p.status === status) };
		})
		.filter(
			({ status, group }) =>
				group.length || dragging.value || (options.value.emptyColumns && status !== "canceled")
		)
);
const activeFields = computed(() => fields.filter((key) => options.value.filters[key]?.length));
const detail = computed(() => visible.value.find((p) => p.id === detailId.value));
const blockers = computed(() =>
	projects.value.filter((p) => graph.value[detailId.value ?? ""]?.includes(p.id))
);
const blocking = computed(() =>
	projects.value.filter((p) => graph.value[p.id]?.includes(detailId.value ?? ""))
);
const projectLabel = (field: Field, value: string) =>
	choices.value[field].find((o) => o.id === value)?.label ?? value;
const nameInputId = `${id}-project-name`;
const invalidRange = computed(
	() =>
		draft.value?.start &&
		draft.value.target &&
		timeframeEnd(draft.value.target) < draft.value.start.date
);
const element = (name: string) => document.getElementById(`${id}-${name}`);

function loadViews() {
	try {
		const data: unknown = JSON.parse(localStorage.getItem(storageKey.value) ?? "[]");
		saved.value = Array.isArray(data) ? data.filter(savedView) : [];
	} catch {
		saved.value = [];
	}
	selectedView.value = "all";
}
function patchOptions(patch: Partial<Options>) {
	options.value = { ...options.value, ...patch };
}
function writeViews(next: SavedView[]) {
	saved.value = next;
	try {
		localStorage.setItem(storageKey.value, JSON.stringify(next));
	} catch {
		/* Session state remains usable. */
	}
}
function applyView(viewId: string) {
	const preset = saved.value.find((v) => v.id === viewId);
	options.value = preset?.options ?? defaults;
	selectedView.value = preset?.id ?? "all";
	detailId.value = undefined;
	centerOn(today);
}
function saveView() {
	const name = viewName.value.trim();
	if (
		!name ||
		["All projects", ...saved.value.map((v) => v.name)].some(
			(v) => v.toLowerCase() === name.toLowerCase()
		)
	) {
		saveError.value = name ? "A view already uses this name." : "Enter a view name.";
		return;
	}
	const viewId = globalThis.crypto?.randomUUID?.() ?? `view-${Date.now()}`;
	writeViews([...saved.value, { id: viewId, name, options: options.value }]);
	selectedView.value = viewId;
	saveOpen.value = false;
}
async function openSave() {
	viewName.value = "";
	saveError.value = "";
	displayOpen.value = false;
	await nextTick();
	saveOpen.value = true;
}
function deleteView() {
	writeViews(saved.value.filter((v) => v.id !== selectedView.value));
	applyView("all");
	displayOpen.value = false;
}
function toggleFilter(field: Field, value: string) {
	const values = options.value.filters[field] ?? [];
	patchOptions({
		filters: {
			...options.value.filters,
			[field]: values.includes(value)
				? values.filter((item) => item !== value)
				: [...values, value],
		},
	});
}
function clearFilters(field?: Field) {
	patchOptions({ filters: field ? { ...options.value.filters, [field]: [] } : {} });
	element("filter")?.focus();
}
async function chooseField(field?: Field) {
	filterField.value = field;
	await nextTick();
	element("filter-panel")?.querySelector("input")?.focus();
}
function changeFilter(open: boolean) {
	filterOpen.value = open;
	if (open) filterField.value = undefined;
}
function toolbarKeys(event: KeyboardEvent) {
	if (
		event.defaultPrevented ||
		event.isComposing ||
		event.repeat ||
		event.altKey ||
		event.metaKey ||
		event.ctrlKey ||
		!(event.target instanceof HTMLElement) ||
		event.target.closest("input,textarea,select,[contenteditable]")
	)
		return;
	const key = event.key.toLowerCase();
	const button =
		key === "f" && !event.shiftKey
			? element("filter")
			: key === "v" && event.shiftKey
				? element("display")
				: null;
	if (!button) return;
	event.preventDefault();
	button.focus();
	button.click();
}
function openDraft(event: MouseEvent, status: Status = "backlog") {
	draftOpener = event.currentTarget as HTMLElement;
	initialStatus.value = status;
	invalidName.value = false;
	draft.value = emptyDraft(status);
}
function patchDraft(patch: Partial<Draft>) {
	if (draft.value) draft.value = { ...draft.value, ...patch };
}
function focusDraft(event: Event) {
	event.preventDefault();
	document.getElementById(nameInputId)?.focus();
}
function returnDraftFocus(event: Event) {
	event.preventDefault();
	(draftOpener?.isConnected ? draftOpener : element("create"))?.focus();
}
function closeDraft() {
	const current = draft.value;
	if (!current) return;
	if (
		current.name ||
		current.summary ||
		current.description ||
		current.lead ||
		current.start ||
		current.target ||
		current.priority !== "none" ||
		current.status !== initialStatus.value ||
		current.teams.length > 1 ||
		current.teams[0] !== "design"
	) {
		discardOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		discardOpen.value = true;
	} else draft.value = undefined;
}
function returnDiscardFocus(event: Event) {
	event.preventDefault();
	if (discardConfirmed) {
		discardConfirmed = false;
		draft.value = undefined;
	} else
		(discardOpener?.isConnected ? discardOpener : document.getElementById(nameInputId))?.focus();
}
function submitProject() {
	const current = draft.value;
	if (!current) return;
	const name = current.name.trim();
	if (!name) {
		invalidName.value = true;
		document.getElementById(nameInputId)?.focus();
		return;
	}
	if (invalidRange.value) return;
	projects.value = [
		{
			...current,
			name,
			summary: current.summary.trim(),
			description: current.description.trim(),
			id: `new-${++nextProject}`,
			issues: 0,
			progress: 0,
		},
		...projects.value,
	];
	patchOptions({ filters: {} });
	draft.value = undefined;
}
function toggleTeam(value: string) {
	const current = draft.value;
	if (!current || (current.teams.length === 1 && current.teams[0] === value)) return;
	const next = current.teams.includes(value)
		? current.teams.filter((item) => item !== value)
		: [...current.teams, value];
	patchDraft({
		teams: next,
		lead: next.includes(people.find((p) => p.id === current.lead)?.team ?? "") ? current.lead : "",
	});
}
function updateProject(projectId: string, patch: Partial<Project>) {
	projects.value = projects.value.map((p) => (p.id === projectId ? { ...p, ...patch } : p));
}
function toggleDependency(projectId: string, blocker: string) {
	const current = graph.value;
	const list = current[projectId] ?? [];
	if (list.includes(blocker))
		graph.value = { ...current, [projectId]: list.filter((item) => item !== blocker) };
	else if (canAdd(current, projectId, blocker))
		graph.value = { ...current, [projectId]: [...list, blocker] };
}
function openDetail(project: Project, event: MouseEvent, locate = false) {
	detailOpener = event.currentTarget as HTMLElement;
	detailId.value = project.id;
	if (locate && (project.start || project.target))
		centerOn(day(project.start?.date ?? timeframeEnd(project.target!)));
}
function closeDetail() {
	detailId.value = undefined;
	(detailOpener?.isConnected ? detailOpener : element("display"))?.focus();
}
async function move(project: Project, target: Status, control: "open" | "move") {
	if (project.status === target) return;
	updateProject(project.id, { status: target });
	announcement.value = `${project.name} moved to ${statuses[target]}`;
	await nextTick();
	requestAnimationFrame(() => {
		const card = board.value?.querySelector<HTMLElement>(
			`[data-project-card="${project.id}"] [data-project-card-${control}]`
		);
		(card ?? board.value ?? element("filter"))?.focus();
	});
}
function targetAt(current: Gesture) {
	const column = document
		.elementFromPoint(current.x, current.y)
		?.closest<HTMLElement>("[data-project-column]");
	return column && board.value?.contains(column)
		? (column.dataset.projectColumn as Status)
		: undefined;
}
function track(current: Gesture) {
	if (gesture !== current || !current.active) return;
	const bounds = board.value?.getBoundingClientRect();
	if (
		bounds &&
		current.y > bounds.top &&
		current.y < bounds.bottom &&
		current.x >= bounds.left &&
		current.x <= bounds.right
	) {
		if (current.x < bounds.left + 28) board.value!.scrollLeft -= 12;
		else if (current.x > bounds.right - 28) board.value!.scrollLeft += 12;
	}
	dropTarget.value = targetAt(current);
	current.frame = requestAnimationFrame(() => track(current));
}
function activate(current: Gesture) {
	if (gesture !== current) return;
	current.active = true;
	skipClick = current.id;
	dragging.value = current.id;
	track(current);
}
function stopGesture() {
	const current = gesture;
	if (!current) return;
	gesture = null;
	window.clearTimeout(current.timer);
	if (current.frame !== undefined) cancelAnimationFrame(current.frame);
	if (current.element.hasPointerCapture(current.pointer))
		current.element.releasePointerCapture(current.pointer);
	dragging.value = undefined;
	dropTarget.value = undefined;
}
function cancelDrag(event: KeyboardEvent) {
	if (event.key === "Escape" && gesture) {
		event.preventDefault();
		stopGesture();
	}
}
onMounted(() => {
	loadViews();
	window.addEventListener("keydown", cancelDrag);
	window.addEventListener("blur", stopGesture);
});
onBeforeUnmount(() => {
	window.removeEventListener("keydown", cancelDrag);
	window.removeEventListener("blur", stopGesture);
	stopGesture();
});
watch(storageKey, loadViews);
watch(
	() => options.value.view,
	(view) => {
		if (view !== "board") stopGesture();
	}
);

function beginDrag(event: PointerEvent, projectId: string) {
	if (!event.isPrimary || event.button !== 0 || gesture) return;
	skipClick = undefined;
	const hold = event.pointerType === "touch";
	if (hold && !(event.target instanceof Element && event.target.closest("[data-project-grip]")))
		return;
	const { pointerId: pointer, clientX: x, clientY: y } = event;
	const element = event.currentTarget as HTMLButtonElement;
	const current: Gesture = {
		id: projectId,
		pointer,
		element,
		originX: x,
		originY: y,
		x,
		y,
		active: false,
	};
	gesture = current;
	element.setPointerCapture(pointer);
	if (hold) current.timer = window.setTimeout(() => activate(current), 170);
}
function dragMove(event: PointerEvent) {
	const current = gesture;
	if (!current || current.pointer !== event.pointerId) return;
	current.x = event.clientX;
	current.y = event.clientY;
	const distance = Math.hypot(current.x - current.originX, current.y - current.originY);
	if (current.active) dropTarget.value = targetAt(current);
	else if (event.pointerType === "touch" && distance > 8) {
		skipClick = current.id;
		stopGesture();
	} else if (event.pointerType !== "touch" && distance >= 6) activate(current);
}
function dragEnd(event: PointerEvent) {
	const current = gesture;
	if (!current || current.pointer !== event.pointerId) return;
	current.x = event.clientX;
	current.y = event.clientY;
	const target = current.active ? targetAt(current) : undefined;
	const project = projects.value.find((p) => p.id === current.id);
	stopGesture();
	if (target && project) void move(project, target, "open");
}
function cardContext(event: MouseEvent, project: Project) {
	if (gesture?.id === project.id || skipClick === project.id) event.preventDefault();
}
function cardClick(event: MouseEvent, project: Project) {
	if (skipClick === project.id && event.detail) {
		skipClick = undefined;
		return;
	}
	openDetail(project, event);
}

const scale = computed(() => scales[options.value.scale]);
const first = computed(() => monthOf(anchor.value, -scale.value.months));
const last = computed(() => monthOf(anchor.value, scale.value.months + 1));
const width = computed(() => (last.value - first.value) * scale.value.pixels);
const offset = (date: number) => (date - first.value) * scale.value.pixels;
const inRange = (date: number) => date >= first.value && date < last.value;
const showList = computed(() => options.value.projectList && visible.value.length > 0);
const monthsShown = computed(() =>
	Array.from({ length: scale.value.months * 2 + 1 }, (_, n) => monthOf(first.value, n))
);
const ticks = computed(() => {
	if (options.value.scale === "year" && !options.value.weekNumbers) return [];
	const step = options.value.scale === "week" ? 1 : options.value.scale === "month" ? 7 : 14;
	const start = step === 1 ? first.value : first.value + ((4 - (first.value % 7) + 7) % 7);
	return Array.from({ length: Math.ceil((last.value - start) / step) }, (_, n) => start + n * step);
});
function tickLabel(date: number) {
	const monday = ((date % 7) + 7) % 7 === 4;
	if (!options.value.weekNumbers || (options.value.scale === "week" && !monday))
		return new Date(date * DAY).getUTCDate();
	const jan4 = day(`${iso(date + 3).slice(0, 4)}-01-04`);
	return `W${1 + Math.floor((date - jan4 + ((((jan4 - 4) % 7) + 7) % 7)) / 7)}`;
}
function midpoint(port: HTMLDivElement) {
	return (
		(port.clientWidth -
			(port.querySelector<HTMLElement>("[data-project-sidebar]")?.offsetWidth ?? 0)) /
		2
	);
}
function centeredDate() {
	const port = scrollport.value;
	return port
		? first.value + Math.round((port.scrollLeft + midpoint(port)) / scale.value.pixels)
		: today;
}
function centerOn(date: number) {
	anchor.value = date;
	centerRequest.value = { date };
}
watch(
	[centerRequest, first, scale, scrollport, showList],
	() => {
		const port = scrollport.value;
		if (port)
			port.scrollLeft =
				(centerRequest.value.date - first.value) * scale.value.pixels - midpoint(port);
	},
	{ flush: "post" }
);
function zoom(next: Scale) {
	if (next !== options.value.scale) {
		const date = centeredDate();
		patchOptions({ scale: next });
		centerOn(date);
	}
}
function chooseMode(mode: Mode) {
	if (options.value.view !== "timeline" && mode === "timeline") centerOn(today);
	patchOptions({ view: mode });
}
function setDisplay(key: keyof typeof switches, checked: boolean) {
	if (key === "projectList") centerOn(centeredDate());
	patchOptions({ [key]: checked });
}
function timelineKeys(event: KeyboardEvent) {
	if (
		event.defaultPrevented ||
		event.isComposing ||
		event.repeat ||
		event.altKey ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		!(event.target instanceof HTMLElement) ||
		event.target.closest("input,textarea,select,[contenteditable],[role=dialog],[role=menu]")
	)
		return;
	const key = event.key.toLowerCase();
	if (key === "t") {
		event.preventDefault();
		centerOn(today);
	} else if (Object.hasOwn(scaleKeys, key)) {
		event.preventDefault();
		zoom(scaleKeys[key as keyof typeof scaleKeys]);
	}
}
const lines = computed(() =>
	options.value.dependencies
		? visible.value.flatMap((p, index) =>
				(graph.value[p.id] ?? []).flatMap((blocker) => {
					const row = visible.value.findIndex((item) => item.id === blocker);
					const dates = row >= 0 ? endpoints(visible.value[row], p) : undefined;
					if (!dates || !inRange(dates.start) || !inRange(dates.end)) return [];
					const from = offset(dates.end + 1),
						to = offset(dates.start),
						elbow = (from + to) / 2;
					return [
						{
							id: `${blocker}:${p.id}`,
							violated: dates.end > dates.start,
							path: `M${from} ${AXIS + row * ROW + 41}H${elbow}V${AXIS + index * ROW + 41}H${to}`,
						},
					];
				})
			)
		: []
);
const timelineRows = computed(() =>
	visible.value.map((project) => {
		const start = project.start && day(project.start.date),
			end = project.target && day(timeframeEnd(project.target));
		const left = Math.max(0, offset(start ?? (end === undefined ? today : end - 13)));
		const right = Math.min(
			width.value,
			offset((end ?? (start === undefined ? today + 9 : start + 13)) + 1)
		);
		return { project, left, right, dated: start !== undefined || end !== undefined };
	})
);
function changeMilestone(project: Project, milestone: Milestone, value?: Timeframe) {
	if (!value) return;
	updateProject(project.id, {
		milestones: project.milestones?.map((m) =>
			m.id === milestone.id ? { ...m, date: value.date } : m
		),
	});
	if (!inRange(day(value.date))) centerOn(day(value.date));
}
</script>

<template>
	<section
		aria-label="Projects"
		class="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-muted/20 text-sm text-foreground"
	>
		<PageLayout width="full" class="min-w-0 gap-0 p-0">
			<PageLayoutHeader
				class="flex min-h-11 flex-row items-center justify-between gap-2 border-b border-border px-4 py-1.5"
			>
				<PageLayoutTitle tag="h2" class="text-[13px] font-medium">Projects</PageLayoutTitle>
				<Button :id="`${id}-create`" size="sm" variant="ghost" @click="openDraft($event)"
					><span aria-hidden="true">+</span> New project</Button
				>
			</PageLayoutHeader>
			<PageLayoutToolbar
				class="flex flex-wrap justify-between gap-2 px-3 py-2"
				@keydown="toolbarKeys"
			>
				<NativeSelect
					aria-label="Saved project views"
					size="sm"
					:model-value="selectedView"
					class="max-w-36 truncate rounded-full"
					@update:model-value="applyView"
				>
					<NativeSelectOption value="all">All projects</NativeSelectOption>
					<NativeSelectOption v-for="view in saved" :key="view.id" :value="view.id">{{
						view.name
					}}</NativeSelectOption>
				</NativeSelect>
				<div class="flex flex-wrap items-center gap-1.5">
					<Popover :open="filterOpen" @update:open="changeFilter">
						<PopoverTrigger as-child
							><Button
								:id="`${id}-filter`"
								size="sm"
								variant="ghost"
								aria-label="Add filter"
								aria-keyshortcuts="F"
								>Filter</Button
							></PopoverTrigger
						>
						<PopoverContent
							:id="`${id}-filter-panel`"
							appearance="surface"
							align="end"
							aria-label="Project filters"
							class="w-60 gap-0 p-1.5"
							@open-auto-focus="focusSearch"
						>
							<Button v-if="filterField" size="xs" variant="ghost" @click="chooseField()"
								>‹ {{ labels[filterField] }}</Button
							>
							<Choices
								:key="filterField ?? 'fields'"
								search="Search filters"
								:choices="
									filterField
										? choices[filterField]
										: fields.map((field) => ({ id: field, label: labels[field] }))
								"
								:selected="filterField ? options.filters[filterField] : []"
								@choose="
									(value) =>
										filterField ? toggleFilter(filterField, value) : chooseField(value as Field)
								"
							/>
						</PopoverContent>
					</Popover>
					<Popover v-model:open="displayOpen">
						<PopoverTrigger as-child
							><Button
								:id="`${id}-display`"
								size="sm"
								variant="ghost"
								aria-keyshortcuts="Shift+V"
								aria-label="Display options"
								>Display</Button
							></PopoverTrigger
						>
						<PopoverContent appearance="options" align="end" aria-label="Display options">
							<Tabs
								:model-value="options.view"
								activation-mode="manual"
								loop
								@update:model-value="chooseMode"
							>
								<div class="border-b border-border px-4 py-2">
									<TabsList aria-label="Project view" variant="capsule"
										><TabsTrigger v-for="(label, mode) in modes" :key="mode" :value="mode">{{
											label
										}}</TabsTrigger></TabsList
									>
								</div>
								<TabsContent
									v-for="(keys, mode) in modeSwitches"
									:key="mode"
									:value="mode"
									class="grid gap-2 px-4 pt-2"
								>
									<p v-if="mode === 'list'" class="text-muted-foreground">
										Show projects in a sortable table.
									</p>
									<p v-if="mode === 'board'" class="flex justify-between">
										Columns <span class="text-muted-foreground">Status</span>
									</p>
									<div
										v-for="key in keys"
										:key="key"
										class="flex items-center justify-between gap-3"
									>
										<span>{{ switches[key] }}</span
										><Switch
											:aria-label="switches[key]"
											size="sm"
											appearance="settings"
											:model-value="options[key]"
											@update:model-value="setDisplay(key, $event)"
										/>
									</div>
								</TabsContent>
							</Tabs>
							<div class="grid gap-2 px-4 py-2">
								<label class="flex items-center justify-between gap-2"
									>Sort by
									<NativeSelect
										size="sm"
										:model-value="options.order ?? ''"
										@update:model-value="patchOptions({ order: $event || undefined })"
										><NativeSelectOption value="">Default</NativeSelectOption
										><NativeSelectOption v-for="key in orders" :key="key" :value="key">{{
											labels[key]
										}}</NativeSelectOption></NativeSelect
									></label
								>
								<div v-if="options.order" class="flex justify-between gap-2">
									<span>Descending</span
									><Switch
										aria-label="Descending"
										size="sm"
										:model-value="options.descending"
										@update:model-value="patchOptions({ descending: $event })"
									/>
								</div>
							</div>
							<div class="flex flex-wrap gap-2 border-t border-border px-4 py-2">
								<Button size="sm" variant="outline" @click="openSave">Save current view</Button
								><Button v-if="selectedView !== 'all'" size="sm" variant="ghost" @click="deleteView"
									>Delete saved view</Button
								>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</PageLayoutToolbar>
			<div
				v-if="activeFields.length"
				aria-label="Active filters"
				class="mx-2 mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-accent/50 p-2"
			>
				<div v-for="field in activeFields" :key="field" class="flex max-w-full items-center gap-1">
					<Picker
						:label="`Edit ${labels[field]}`"
						:choices="choices[field]"
						:selected="options.filters[field]"
						@choose="toggleFilter(field, $event)"
						><span class="max-w-52 truncate"
							>{{ labels[field] }} is
							{{
								options.filters[field]?.map((value) => projectLabel(field, value)).join(", ")
							}}</span
						></Picker
					><Button
						size="icon-xs"
						variant="ghost"
						:aria-label="`Remove ${labels[field]}`"
						@click="clearFilters(field)"
						>×</Button
					>
				</div>
				<Button size="xs" variant="ghost" class="ms-auto" @click="clearFilters()"
					>Clear filters</Button
				>
			</div>
			<div v-if="options.view === 'list' && visible.length" class="min-h-[400px] min-w-0">
				<Table
					aria-label="Projects list"
					scroll-label="Scroll projects list"
					class="min-w-[710px] table-fixed text-[13px]"
				>
					<TableHeader
						><TableRow
							><TableHead
								v-for="column in columns"
								:key="column"
								scope="col"
								:class="
									column === 'name'
										? 'w-[33%] ps-4'
										: column === 'target' || column === 'status'
											? 'w-[15%]'
											: undefined
								"
								:aria-sort="
									options.order === column
										? options.descending
											? 'descending'
											: 'ascending'
										: undefined
								"
							>
								<Button
									v-if="orders.includes(column as Order)"
									size="xs"
									variant="ghost"
									class="-ms-2"
									@click="
										patchOptions({
											order: column as Order,
											descending: options.order === column && !options.descending,
										})
									"
									>{{ labels[column]
									}}<span v-if="options.order === column" aria-hidden="true">{{
										options.descending ? "↓" : "↑"
									}}</span></Button
								><template v-else>{{ labels[column] }}</template>
							</TableHead></TableRow
						></TableHeader
					>
					<TableBody
						><TableRow v-for="project in visible" :key="project.id" class="h-12">
							<TableCell class="ps-4"
								><Button
									size="sm"
									variant="ghost"
									class="max-w-full justify-start px-0 font-medium"
									@click="openDetail(project, $event)"
									><ProjectIcon /><span class="truncate">{{ project.name }}</span></Button
								></TableCell
							>
							<TableCell
								><span
									role="img"
									aria-label="No updates"
									class="inline-block size-3.5 rounded-full border border-dashed border-muted-foreground/60"
							/></TableCell>
							<TableCell>{{
								project.priority === "none" ? "⋯" : priorities[project.priority]
							}}</TableCell>
							<TableCell
								><span :title="projectLabel('lead', project.lead)"
									><span class="sr-only">{{ projectLabel("lead", project.lead) }}</span
									><span aria-hidden="true">{{
										people.find((p) => p.id === project.lead)?.initials ?? "–"
									}}</span></span
								></TableCell
							>
							<TableCell>{{ project.target && dateLabel(project.target) }}</TableCell
							><TableCell>{{ project.issues }}</TableCell>
							<TableCell
								><span class="inline-flex items-center gap-1.5"
									><StatusDot :status="project.status" /><span class="sr-only"
										>{{ statuses[project.status] }} · </span
									>{{ project.progress }}%</span
								></TableCell
							>
						</TableRow></TableBody
					>
				</Table>
			</div>
			<div
				v-if="options.view === 'board' && visible.length"
				ref="board"
				role="region"
				aria-label="Projects board"
				tabindex="0"
				:class="['flex min-h-[400px] min-w-0 gap-2 overflow-x-auto px-2 pb-3', focusClass]"
				@pointermove="dragMove"
				@pointerup="dragEnd"
				@pointercancel="stopGesture"
				@lostpointercapture="stopGesture"
			>
				<section
					v-for="{ status, label, group } in groups"
					:key="status"
					:aria-label="label"
					:data-project-column="status"
					:data-drop-target="dropTarget === status ? '' : undefined"
					class="w-[min(345px,85vw)] shrink-0 rounded-lg bg-accent/35 px-2 pb-2 data-drop-target:bg-primary/10 data-drop-target:ring-1 data-drop-target:ring-primary/50 data-drop-target:ring-inset"
				>
					<header class="flex h-12 items-center gap-2 px-1 text-[13px]">
						<StatusDot :status="status" />
						<h3 class="font-medium">{{ label }}</h3>
						<span class="text-muted-foreground">{{ group.length }}</span
						><Button
							size="icon-xs"
							variant="ghost"
							class="ms-auto"
							:aria-label="`New project in ${label}`"
							@click="openDraft($event, status)"
							>+</Button
						>
					</header>
					<div class="space-y-2">
						<article
							v-for="project in group"
							:key="project.id"
							:data-project-card="project.id"
							:data-dragging="dragging === project.id ? '' : undefined"
							class="relative rounded-[10px] border border-border bg-card shadow-xs focus-within:border-ring/65 hover:bg-accent data-dragging:opacity-60"
						>
							<button
								type="button"
								data-project-card-open
								:class="[
									'block w-full cursor-grab rounded-[inherit] px-3 py-2.5 text-start text-[13px] select-none',
									focusClass,
								]"
								@pointerdown="beginDrag($event, project.id)"
								@contextmenu="cardContext($event, project)"
								@click="cardClick($event, project)"
							>
								<span class="flex items-center gap-2 pe-7"
									><span class="touch-none" data-project-grip><ProjectIcon /></span
									><span class="min-w-0 flex-1 truncate font-medium">{{ project.name }}</span
									><StatusDot :status="status" /><span
										v-if="project.lead"
										:title="projectLabel('lead', project.lead)"
										class="rounded-full bg-info/15 p-1 text-[8px] text-info"
										>{{ people.find((p) => p.id === project.lead)?.initials }}</span
									></span
								>
								<span v-if="project.target" class="mt-2 block text-xs text-muted-foreground">{{
									dateLabel(project.target)
								}}</span
								><span class="mt-2 block text-xs text-muted-foreground"
									>{{ project.issues }} issues</span
								>
							</button>
							<DropdownMenu
								><DropdownMenuTrigger as-child
									><Button
										data-project-card-move
										:aria-label="`Move project: ${project.name}`"
										size="icon-xs"
										variant="ghost"
										class="absolute end-2 top-2"
										>⠿</Button
									></DropdownMenuTrigger
								>
								<DropdownMenuContent appearance="surface" align="end" class="w-40"
									><DropdownMenuItem
										v-for="choice in statusChoices"
										:key="choice.id"
										:disabled="choice.id === status"
										@select="move(project, choice.id as Status, 'move')"
										><StatusDot :status="choice.id as Status" />{{ choice.label }}</DropdownMenuItem
									></DropdownMenuContent
								>
							</DropdownMenu>
						</article>
					</div>
				</section>
			</div>
			<section
				v-if="options.view === 'timeline' || !visible.length"
				:aria-label="options.view === 'timeline' ? 'Projects timeline' : undefined"
				:data-scale="options.view === 'timeline' ? options.scale : undefined"
				class="min-w-0 border-t border-border"
				@keydown="options.view === 'timeline' && timelineKeys($event)"
			>
				<div
					v-if="options.view === 'timeline'"
					class="flex flex-wrap justify-end gap-1 border-b border-border px-2 py-1.5"
				>
					<Button
						size="icon-xs"
						variant="outline"
						aria-label="Previous period"
						@click="centerOn(stepDate(centeredDate(), options.scale, -1))"
						>‹</Button
					><Button
						size="icon-xs"
						variant="outline"
						aria-label="Next period"
						@click="centerOn(stepDate(centeredDate(), options.scale, 1))"
						>›</Button
					><Button size="xs" variant="outline" aria-keyshortcuts="T" @click="centerOn(today)"
						>Today</Button
					>
					<NativeSelect
						size="sm"
						aria-label="Timeline zoom"
						:model-value="options.scale"
						@update:model-value="zoom"
						><NativeSelectOption v-for="(item, key) in scales" :key="key" :value="key">{{
							item.label
						}}</NativeSelectOption></NativeSelect
					>
				</div>
				<div
					v-if="options.view === 'timeline'"
					ref="scrollport"
					role="region"
					aria-label="Scroll project dates"
					tabindex="0"
					:class="['min-w-0 overflow-x-auto', focusClass]"
				>
					<div
						class="relative grid min-h-[44px] w-max min-w-full auto-rows-min content-start [--project-sidebar:120px] sm:[--project-sidebar:224px]"
						:style="{
							gridTemplateColumns: `${showList ? 'var(--project-sidebar)' : '0px'} ${width}px`,
						}"
					>
						<div class="pointer-events-none absolute inset-y-0 col-start-2" aria-hidden="true">
							<div
								v-for="date in monthsShown"
								:key="date"
								class="absolute inset-y-0 border-s border-dashed border-border"
								:style="{ left: `${offset(date)}px` }"
							/>
							<div
								v-if="inRange(today)"
								class="absolute inset-y-0 border-s border-primary/65"
								:style="{ left: `${offset(today)}px` }"
							/>
						</div>
						<svg
							v-if="lines.length"
							aria-hidden="true"
							class="pointer-events-none absolute top-0 z-10 col-start-2"
							:width="width"
							:height="AXIS + visible.length * ROW"
						>
							<path
								v-for="line in lines"
								:key="line.id"
								:data-project-dependency="line.id"
								:data-violated="line.violated"
								:d="line.path"
								stroke="currentColor"
								stroke-width="1.5"
								fill="none"
								:class="line.violated ? 'text-destructive' : 'text-info'"
							/>
						</svg>
						<div
							data-project-sidebar
							class="sticky start-0 z-20 col-start-1 row-start-1 h-11 bg-background"
						/>
						<div
							aria-hidden="true"
							class="relative col-start-2 row-start-1 h-11 border-b border-border text-[11px] text-muted-foreground"
						>
							<span
								v-for="date in monthsShown"
								:key="date"
								class="absolute top-1.5 truncate px-1.5 font-medium uppercase"
								:style="{
									left: `${offset(date)}px`,
									width: `${offset(monthOf(date, 1)) - offset(date)}px`,
								}"
								>{{ monthLabel.format(date * DAY) }}
								{{ new Date(date * DAY).getUTCMonth() === 0 ? iso(date).slice(0, 4) : "" }}</span
							>
							<span
								v-for="date in ticks"
								:key="`tick-${date}`"
								class="absolute bottom-1 border-s border-border/75 px-1 text-[10px]"
								:style="{ left: `${offset(date)}px` }"
								>{{ tickLabel(date) }}</span
							>
							<span
								v-if="inRange(today)"
								class="absolute bottom-1 -translate-x-1/2 rounded-full bg-primary px-1.5 text-[10px] whitespace-nowrap text-primary-foreground"
								:style="{ left: `${offset(today)}px` }"
								>{{ dateLabel({ date: iso(today), grain: "day" }) }}</span
							>
						</div>
						<template v-for="{ project, left, right, dated } in timelineRows" :key="project.id">
							<div
								class="sticky start-0 z-20 col-start-1 h-[72px] min-w-0 border-b border-border bg-background"
							>
								<button
									v-if="showList"
									type="button"
									:aria-label="project.name"
									:class="[
										'flex h-full w-full items-center gap-1.5 px-2 text-start text-[13px] hover:bg-accent',
										focusClass,
									]"
									@click="openDetail(project, $event, true)"
								>
									<ProjectIcon /><span class="min-w-0 flex-1 truncate" :title="project.name">{{
										project.name
									}}</span
									><StatusDot :status="project.status" />
								</button>
							</div>
							<div class="relative col-start-2 h-[72px] border-b border-border/60">
								<template v-if="right > left"
									><span
										aria-hidden="true"
										class="absolute top-2 max-w-56 truncate"
										:style="{ left: `${left}px`, maxWidth: `${Math.min(224, width - left)}px` }"
										>{{ project.name }}</span
									>
									<button
										type="button"
										:data-project-bar="project.id"
										:data-dated="dated"
										:aria-label="`${project.name} · ${dated ? `${project.start ? dateLabel(project.start) : 'No start date'} – ${project.target ? dateLabel(project.target) : 'No target date'}` : 'Unscheduled'}`"
										:class="[
											'absolute top-7 h-[26px] overflow-hidden rounded-md border border-border bg-card hover:border-primary/65',
											!dated && 'border-dashed',
											focusClass,
										]"
										:style="{
											left: `${left}px`,
											width: `${Math.min(Math.max(20, right - left), width - left)}px`,
										}"
										@click="openDetail(project, $event)"
									>
										<span
											v-if="!project.start"
											class="absolute inset-y-0 start-0 w-1/3 bg-linear-to-r from-muted to-transparent"
										/><span
											v-if="!project.target"
											class="absolute inset-y-0 end-0 w-1/3 bg-linear-to-l from-muted to-transparent"
										/><span
											v-if="project.progress"
											class="absolute inset-y-0 start-0 bg-primary/20"
											:style="{ width: `${project.progress}%` }"
										/>
									</button>
								</template>
								<template v-if="options.milestones"
									><div
										v-for="m in project.milestones?.filter((item) => inRange(day(item.date)))"
										:key="m.id"
										class="absolute top-7 z-10 -translate-x-1/2"
										:style="{ left: `${offset(day(m.date))}px` }"
									>
										<Popover
											><PopoverTrigger as-child
												><Button
													size="icon-xs"
													variant="ghost"
													:aria-label="`Milestone: ${m.name}`"
													:title="`${m.name} · ${m.date}`"
													><span
														aria-hidden="true"
														:class="[
															'size-2 rotate-45 rounded-[1px] border',
															m.progress === 100
																? 'border-success bg-success/30'
																: 'border-warning bg-warning/30',
														]" /></Button
											></PopoverTrigger>
											<PopoverContent
												appearance="surface"
												:aria-labelledby="`${id}-milestone-${project.id}-${m.id}`"
												class="w-52 gap-1 p-3 text-xs"
												><strong :id="`${id}-milestone-${project.id}-${m.id}`">{{ m.name }}</strong
												><span class="text-muted-foreground"
													>{{ dateLabel({ date: m.date, grain: "day" }) }} · {{ m.progress }}%
													complete</span
												><DatePicker
													label="Edit milestone date"
													:model-value="{ date: m.date, grain: 'day' }"
													:precisions="['day']"
													:allow-clear="false"
													@update:model-value="changeMilestone(project, m, $event)"
											/></PopoverContent> </Popover
										><span
											v-if="options.scale === 'week'"
											aria-hidden="true"
											class="pointer-events-none absolute top-6 left-1/2 max-w-24 -translate-x-1/2 truncate text-[10px] text-muted-foreground"
											>{{ m.name }}</span
										>
									</div></template
								>
							</div>
						</template>
					</div>
				</div>
				<div
					v-if="!visible.length"
					class="grid min-h-[310px] place-content-center gap-3 p-4 text-center"
				>
					<h3 class="font-medium">
						{{ activeFields.length ? "No projects matching the filters" : "No projects yet" }}
					</h3>
					<p class="text-xs text-muted-foreground">
						{{
							activeFields.length
								? `${projects.length} projects hidden by filters`
								: "Create a project to organize your team's work."
						}}
					</p>
					<div>
						<Button v-if="activeFields.length" size="sm" variant="outline" @click="clearFilters()"
							>Clear filters</Button
						><Button v-else size="sm" variant="outline" @click="openDraft($event)"
							>Create first project</Button
						>
					</div>
				</div>
			</section>
			<aside
				v-if="detail"
				aria-label="Project details"
				class="min-w-0 border-t border-border bg-card px-4 py-3"
			>
				<div class="flex items-center justify-between gap-2">
					<h3 class="font-semibold break-words">{{ detail.name }}</h3>
					<Button
						size="icon-xs"
						variant="ghost"
						aria-label="Close project details"
						@click="closeDetail"
						>×</Button
					>
				</div>
				<p v-if="detail.summary" class="break-words text-muted-foreground">{{ detail.summary }}</p>
				<p v-if="detail.description" class="mt-2 break-words whitespace-pre-wrap">
					{{ detail.description }}
				</p>
				<Collapsible :key="detail.id" appearance="properties" default-open class="mt-2"
					><CollapsibleTrigger>Properties</CollapsibleTrigger
					><CollapsibleContent class="space-y-3 px-2 py-2">
						<p class="text-xs text-muted-foreground">
							{{ statuses[detail.status] }} ·
							{{ detail.teams.map((team) => projectLabel("team", team)).join(", ") }} ·
							{{ projectLabel("lead", detail.lead) }}
						</p>
						<div class="flex flex-wrap gap-2">
							<DatePicker
								label="Edit start date"
								placeholder="Set start date"
								:model-value="detail.start"
								:max="detail.target"
								@update:model-value="updateProject(detail.id, { start: $event })"
							/><DatePicker
								label="Edit target date"
								placeholder="Set target date"
								:model-value="detail.target"
								:min="detail.start"
								@update:model-value="updateProject(detail.id, { target: $event })"
							/>
						</div>
						<div class="space-y-1 text-xs">
							<Picker
								label="Edit blocking projects"
								search="Search projects"
								:choices="
									projects
										.filter((p) => canAdd(graph, detail!.id, p.id))
										.map((p) => ({ id: p.id, label: p.name }))
								"
								empty="No available blockers"
								:selected="graph[detail.id] ?? []"
								@choose="toggleDependency(detail.id, $event)"
								>Blocked by{{ blockers.length ? ` · ${blockers.length}` : "" }}</Picker
							>
							<p v-for="blocker in blockers" :key="blocker.id" class="text-muted-foreground">
								{{ blocker.name
								}}<span v-if="conflict(blocker, detail)" class="text-destructive">
									· Schedule conflict</span
								>
							</p>
							<p v-if="blocking.length" class="text-muted-foreground">
								Blocking · {{ blocking.map((p) => p.name).join(", ") }}
							</p>
						</div>
					</CollapsibleContent></Collapsible
				>
			</aside>
		</PageLayout>
		<span role="status" class="sr-only">{{ announcement }}</span>
		<Dialog v-model:open="saveOpen"
			><DialogContent
				close-label="Close saved view form"
				class="max-w-[min(24rem,calc(100vw-2rem))]"
				@close-auto-focus="
					(event) => {
						event.preventDefault();
						element('display')?.focus();
					}
				"
			>
				<DialogTitle>Save project view</DialogTitle
				><DialogDescription>Save the current filters, sort, and display options.</DialogDescription>
				<form class="space-y-3" @submit.prevent="saveView">
					<label :for="`${id}-view`">View name</label
					><Input
						:id="`${id}-view`"
						v-model="viewName"
						:maxlength="60"
						:aria-invalid="!!saveError"
						:aria-describedby="saveError ? `${id}-view-error` : undefined"
						@input="saveError = ''"
					/>
					<p
						v-if="saveError"
						:id="`${id}-view-error`"
						role="alert"
						class="text-xs text-destructive"
					>
						{{ saveError }}
					</p>
					<div class="flex justify-end gap-2">
						<Button type="button" variant="outline" @click="saveOpen = false">Cancel</Button
						><Button type="submit">Save view</Button>
					</div>
				</form>
			</DialogContent></Dialog
		>
		<Dialog
			:open="!!draft"
			@update:open="
				(open) => {
					if (!open) closeDraft();
				}
			"
			><DialogContent
				:show-close-button="false"
				class="h-[min(750px,88svh)] w-[calc(100%-24px)] max-w-[920px] gap-0 rounded-[21px] p-0 sm:max-w-[920px]"
				@open-auto-focus="focusDraft"
				@close-auto-focus="returnDraftFocus"
			>
				<form v-if="draft" class="flex min-h-0 flex-col" @submit.prevent="submitProject">
					<header class="flex min-h-14 shrink-0 items-center gap-2 px-4 sm:px-6">
						<Picker
							label="Project teams"
							search="Search teams"
							:choices="teamChoices"
							:selected="draft.teams"
							:disabled="singleTeam"
							:portal="draftPortal"
							@choose="toggleTeam"
							>{{ projectLabel("team", draft.teams[0])
							}}{{ draft.teams.length > 1 ? ` +${draft.teams.length - 1}` : "" }}</Picker
						><span aria-hidden="true" class="text-muted-foreground">›</span
						><DialogTitle class="text-[13px] font-medium">New project</DialogTitle
						><DialogDescription class="sr-only"
							>Set the project name, properties, and dates.</DialogDescription
						><Button
							type="button"
							size="icon-sm"
							variant="ghost"
							class="ms-auto"
							aria-label="Close project form"
							@click="closeDraft"
							>×</Button
						>
					</header>
					<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-3 sm:px-[26px]">
						<ProjectIcon /><Input
							:id="nameInputId"
							v-model="draft.name"
							aria-label="Project name"
							placeholder="Project name"
							aria-required="true"
							:aria-invalid="invalidName"
							:aria-describedby="invalidName ? `${id}-name-error` : undefined"
							:maxlength="120"
							class="shrink-0 text-2xl md:text-2xl"
							@input="invalidName = false"
						/>
						<p
							v-if="invalidName"
							:id="`${id}-name-error`"
							role="alert"
							class="text-xs text-destructive"
						>
							Enter a project name.
						</p>
						<Input
							v-model="draft.summary"
							aria-label="Project summary"
							placeholder="Add a short summary…"
							:maxlength="240"
						/>
						<div class="flex flex-wrap items-center gap-2 border-b border-border pb-4">
							<NativeSelect size="sm" aria-label="Project status" v-model="draft.status"
								><NativeSelectOption
									v-for="choice in statusChoices"
									:key="choice.id"
									:value="choice.id"
									>{{ choice.label }}</NativeSelectOption
								></NativeSelect
							>
							<NativeSelect size="sm" aria-label="Project priority" v-model="draft.priority"
								><NativeSelectOption
									v-for="choice in priorityChoices"
									:key="choice.id"
									:value="choice.id"
									>{{ choice.label }}</NativeSelectOption
								></NativeSelect
							>
							<NativeSelect size="sm" aria-label="Project lead" v-model="draft.lead"
								><NativeSelectOption value="">No lead</NativeSelectOption
								><NativeSelectOption
									v-for="p in people.filter((person) => draft!.teams.includes(person.team))"
									:key="p.id"
									:value="p.id"
									>{{ p.name }}</NativeSelectOption
								></NativeSelect
							>
							<DatePicker
								label="Start date"
								placeholder="Start"
								:model-value="draft.start"
								:max="draft.target"
								:portal-props="{ to: draftPortal }"
								@update:model-value="patchDraft({ start: $event })"
							/><DatePicker
								label="Target date"
								placeholder="Target"
								:model-value="draft.target"
								:min="draft.start"
								:portal-props="{ to: draftPortal }"
								@update:model-value="patchDraft({ target: $event })"
							/>
						</div>
						<Textarea
							v-model="draft.description"
							aria-label="Project description"
							placeholder="Write a description, a project brief, or collect ideas…"
							class="min-h-28 flex-1 resize-none"
						/>
					</div>
					<footer
						class="flex min-h-[60px] shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-4 sm:px-6"
					>
						<p v-if="invalidRange" role="alert" class="text-xs text-destructive">
							Target date cannot precede the start date.
						</p>
						<Button type="submit" size="sm" :disabled="!!invalidRange">Create project</Button>
					</footer>
				</form>
				<div ref="draftPortal" />
				<AlertDialog v-model:open="discardOpen"
					><AlertDialogContent class="z-[60]" focus-cancel @close-auto-focus="returnDiscardFocus"
						><AlertDialogTitle>Discard changes?</AlertDialogTitle
						><AlertDialogDescription>Your project draft will be cleared.</AlertDialogDescription>
						<div class="flex flex-wrap justify-end gap-2">
							<AlertDialogCancel>Keep editing</AlertDialogCancel
							><AlertDialogAction
								@click="
									discardConfirmed = true;
									discardOpen = false;
								"
								>Discard</AlertDialogAction
							>
						</div></AlertDialogContent
					></AlertDialog
				>
			</DialogContent></Dialog
		>
	</section>
</template>
