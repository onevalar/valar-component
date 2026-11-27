"use client";

// Standalone English preview of the Valar Projects scene; use with the Valar theme.
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@valar/react-ui/alert-dialog";
import { Button } from "@valar/react-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/react-ui/collapsible";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/react-ui/command";
import { DatePicker, dateLabel, timeframeEnd, type Timeframe } from "@valar/react-ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@valar/react-ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import { Input } from "@valar/react-ui/input";
import { NativeSelect, NativeSelectOption } from "@valar/react-ui/native-select";
import {
	PageLayout,
	PageLayoutHeader,
	PageLayoutTitle,
	PageLayoutToolbar,
} from "@valar/react-ui/page-layout";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
import { Switch } from "@valar/react-ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/react-ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/react-ui/tabs";
import { Textarea } from "@valar/react-ui/textarea";
import {
	Fragment,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type FormEvent,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
} from "react";

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

function StatusDot({ status }: { status: Status }) {
	return (
		<span
			aria-hidden="true"
			className={`inline-block size-3.5 shrink-0 rounded-full border ${colors[status]}`}
		/>
	);
}

function ProjectIcon() {
	return (
		<svg
			aria-hidden="true"
			className="size-4 shrink-0 text-info"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.25"
			strokeLinejoin="round"
		>
			<path d="m8 1.5 5.6 3.25v6.5L8 14.5l-5.6-3.25v-6.5L8 1.5Zm5.6 3.25L8 8 2.4 4.75M8 8v6.5" />
		</svg>
	);
}

function Choices({
	options,
	selected,
	onSelect,
	search = "Search values",
	empty = "No matching options",
}: {
	options: Choice[];
	selected?: string[];
	onSelect: (id: string) => void;
	search?: string;
	empty?: string;
}) {
	return (
		<Command className="bg-transparent" loop>
			<CommandInput aria-label={search} placeholder={`${search}…`} />
			<CommandList className="max-h-52 overflow-y-auto">
				<CommandEmpty>{empty}</CommandEmpty>
				{options.map(({ id, label }) => (
					<CommandItem
						key={id}
						value={`choice:${id}`}
						textValue={label}
						aria-current={selected?.includes(id) || undefined}
						onSelect={() => onSelect(id)}
					>
						{label}
						{selected?.includes(id) && (
							<span className="ms-auto" aria-hidden="true">
								✓
							</span>
						)}
					</CommandItem>
				))}
			</CommandList>
		</Command>
	);
}

function Picker({
	label,
	children,
	disabled,
	portal,
	...choices
}: Parameters<typeof Choices>[0] & {
	label: string;
	children: ReactNode;
	disabled?: boolean;
	portal?: HTMLElement | null;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="xs"
					aria-label={label}
					className={controlClass}
					disabled={disabled}
				>
					{children}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				aria-label={label}
				appearance="surface"
				align="start"
				portalProps={portal ? { container: portal } : undefined}
				className="w-60 gap-0 p-1.5"
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					(e.target as HTMLElement).querySelector("input")?.focus();
				}}
			>
				<Choices {...choices} />
			</PopoverContent>
		</Popover>
	);
}

export default function ProjectsExample({
	empty = false,
	singleTeam = false,
}: { empty?: boolean; singleTeam?: boolean } = {}) {
	const id = useId();
	const [today] = useState(() => Math.floor(Date.now() / DAY));
	const [projects, setProjects] = useState(() =>
		empty ? [] : samples(today).slice(0, singleTeam ? 1 : 2)
	);
	const [options, setOptions] = useState(defaults);
	const [graph, setGraph] = useState<Graph>({});
	const [saved, setSaved] = useState<SavedView[]>([]);
	const [selectedView, setSelectedView] = useState("all");
	const [filterOpen, setFilterOpen] = useState(false);
	const [filterField, setFilterField] = useState<Field>();
	const [displayOpen, setDisplayOpen] = useState(false);
	const [saveOpen, setSaveOpen] = useState(false);
	const [viewName, setViewName] = useState("");
	const [saveError, setSaveError] = useState("");
	const [draft, setDraft] = useState<Draft>();
	const [initialStatus, setInitialStatus] = useState<Status>("backlog");
	const [invalidName, setInvalidName] = useState(false);
	const [discardOpen, setDiscardOpen] = useState(false);
	const [draftPortal, setDraftPortal] = useState<HTMLDivElement | null>(null);
	const [detailId, setDetailId] = useState<string>();
	const [dragging, setDragging] = useState<string>();
	const [dropTarget, setDropTarget] = useState<Status>();
	const [announcement, setAnnouncement] = useState("");
	const [anchor, setAnchor] = useState(today);
	const [centerRequest, setCenterRequest] = useState({ date: today });
	const board = useRef<HTMLDivElement>(null);
	const scrollport = useRef<HTMLDivElement>(null);
	const toolbar = useRef<HTMLDivElement>(null);
	const filterButton = useRef<HTMLButtonElement>(null);
	const displayButton = useRef<HTMLButtonElement>(null);
	const mainCreate = useRef<HTMLButtonElement>(null);
	const filterPanel = useRef<HTMLDivElement>(null);
	const draftOpener = useRef<HTMLElement | null>(null);
	const detailOpener = useRef<HTMLElement | null>(null);
	const discardOpener = useRef<HTMLElement | null>(null);
	const discardConfirmed = useRef(false);
	const gesture = useRef<Gesture | null>(null);
	const skipClick = useRef<string | undefined>(undefined);
	const nextProject = useRef(0);
	const statusChoices = entries(statuses);
	const priorityChoices = entries(priorities);
	const teamChoices = entries(teams).slice(0, singleTeam ? 1 : 2);
	const choices = {
		status: statusChoices,
		priority: priorityChoices,
		team: teamChoices,
		lead: [
			{ id: "", label: "No lead" },
			...people
				.filter((p) => teamChoices.some((team) => team.id === p.team))
				.map((p) => ({ id: p.id, label: p.name })),
		],
	};
	const storageKey = `valar.react.projects.views.v1.${empty ? "empty" : singleTeam ? "single" : "sample"}`;
	const visible = visibleProjects(projects, options);
	const activeFields = fields.filter((key) => options.filters[key]?.length);
	const detail = visible.find((p) => p.id === detailId);
	const projectLabel = (field: Field, value: string) =>
		choices[field].find((o) => o.id === value)?.label ?? value;
	const nameInputId = `${id}-project-name`;
	const invalidRange =
		draft?.start && draft.target && timeframeEnd(draft.target) < draft.start.date;

	useEffect(() => {
		try {
			const data: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
			setSaved(Array.isArray(data) ? data.filter(savedView) : []);
		} catch {
			setSaved([]);
		}
		setSelectedView("all");
	}, [storageKey]);

	function patchOptions(patch: Partial<Options>) {
		setOptions((current) => ({ ...current, ...patch }));
	}
	function writeViews(next: SavedView[]) {
		setSaved(next);
		try {
			localStorage.setItem(storageKey, JSON.stringify(next));
		} catch {
			/* Session state remains usable. */
		}
	}
	function applyView(viewId: string) {
		const preset = saved.find((v) => v.id === viewId);
		setOptions(preset?.options ?? defaults);
		setSelectedView(preset?.id ?? "all");
		setDetailId(undefined);
		setAnchor(today);
		setCenterRequest({ date: today });
	}
	function saveView(event: FormEvent) {
		event.preventDefault();
		const name = viewName.trim();
		if (
			!name ||
			["All projects", ...saved.map((v) => v.name)].some(
				(v) => v.toLowerCase() === name.toLowerCase()
			)
		) {
			setSaveError(name ? "A view already uses this name." : "Enter a view name.");
			return;
		}
		const viewId = globalThis.crypto?.randomUUID?.() ?? `view-${Date.now()}`;
		writeViews([...saved, { id: viewId, name, options }]);
		setSelectedView(viewId);
		setSaveOpen(false);
	}
	function toggleFilter(field: Field, value: string) {
		setOptions((current) => {
			const values = current.filters[field] ?? [];
			return {
				...current,
				filters: {
					...current.filters,
					[field]: values.includes(value)
						? values.filter((item) => item !== value)
						: [...values, value],
				},
			};
		});
	}
	function chooseField(field?: Field) {
		setFilterField(field);
		requestAnimationFrame(() => filterPanel.current?.querySelector("input")?.focus());
	}
	function toolbarKeys(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.nativeEvent.isComposing ||
			event.repeat ||
			event.altKey ||
			event.metaKey ||
			event.ctrlKey ||
			!(event.target instanceof HTMLElement) ||
			!toolbar.current?.contains(event.target) ||
			event.target.closest("input,textarea,select,[contenteditable]")
		)
			return;
		const key = event.key.toLowerCase();
		const button =
			key === "f" && !event.shiftKey
				? filterButton.current
				: key === "v" && event.shiftKey
					? displayButton.current
					: null;
		if (!button) return;
		event.preventDefault();
		button.focus();
		button.click();
	}
	function openDraft(opener: HTMLElement, status: Status = "backlog") {
		draftOpener.current = opener;
		setInitialStatus(status);
		setInvalidName(false);
		setDraft(emptyDraft(status));
	}
	function patchDraft(patch: Partial<Draft>) {
		setDraft((current) => current && { ...current, ...patch });
	}
	function closeDraft() {
		if (!draft) return;
		if (
			draft.name ||
			draft.summary ||
			draft.description ||
			draft.lead ||
			draft.start ||
			draft.target ||
			draft.priority !== "none" ||
			draft.status !== initialStatus ||
			draft.teams.length > 1 ||
			draft.teams[0] !== "design"
		) {
			discardOpener.current =
				document.activeElement instanceof HTMLElement ? document.activeElement : null;
			setDiscardOpen(true);
		} else setDraft(undefined);
	}
	function submitProject(event: FormEvent) {
		event.preventDefault();
		if (!draft) return;
		const name = draft.name.trim();
		if (!name) {
			setInvalidName(true);
			document.getElementById(nameInputId)?.focus();
			return;
		}
		if (invalidRange) return;
		const project = {
			...draft,
			name,
			summary: draft.summary.trim(),
			description: draft.description.trim(),
			id: `new-${++nextProject.current}`,
			issues: 0,
			progress: 0,
		};
		setProjects((current) => [project, ...current]);
		patchOptions({ filters: {} });
		setDraft(undefined);
	}
	function toggleTeam(value: string) {
		if (!draft || (draft.teams.length === 1 && draft.teams[0] === value)) return;
		const next = draft.teams.includes(value)
			? draft.teams.filter((item) => item !== value)
			: [...draft.teams, value];
		patchDraft({
			teams: next,
			lead: next.includes(people.find((p) => p.id === draft.lead)?.team ?? "") ? draft.lead : "",
		});
	}
	function updateProject(projectId: string, patch: Partial<Project>) {
		setProjects((current) => current.map((p) => (p.id === projectId ? { ...p, ...patch } : p)));
	}
	function toggleDependency(projectId: string, blocker: string) {
		setGraph((current) => {
			const list = current[projectId] ?? [];
			return list.includes(blocker)
				? { ...current, [projectId]: list.filter((item) => item !== blocker) }
				: canAdd(current, projectId, blocker)
					? { ...current, [projectId]: [...list, blocker] }
					: current;
		});
	}
	function openDetail(project: Project, opener: HTMLElement, locate = false) {
		detailOpener.current = opener;
		setDetailId(project.id);
		if (locate && (project.start || project.target))
			centerOn(day(project.start?.date ?? timeframeEnd(project.target!)));
	}
	function move(project: Project, target: Status, control: "open" | "move") {
		if (project.status === target) return;
		updateProject(project.id, { status: target });
		setAnnouncement(`${project.name} moved to ${statuses[target]}`);
		requestAnimationFrame(() => {
			const card = board.current?.querySelector<HTMLElement>(
				`[data-project-card="${project.id}"] [data-project-card-${control}]`
			);
			(card ?? board.current ?? filterButton.current)?.focus();
		});
	}
	function targetAt(current: Gesture) {
		const column = document
			.elementFromPoint(current.x, current.y)
			?.closest<HTMLElement>("[data-project-column]");
		return column && board.current?.contains(column)
			? (column.dataset.projectColumn as Status)
			: undefined;
	}
	function track(current: Gesture) {
		if (gesture.current !== current || !current.active) return;
		const bounds = board.current?.getBoundingClientRect();
		if (
			bounds &&
			current.y > bounds.top &&
			current.y < bounds.bottom &&
			current.x >= bounds.left &&
			current.x <= bounds.right
		) {
			if (current.x < bounds.left + 28) board.current!.scrollLeft -= 12;
			else if (current.x > bounds.right - 28) board.current!.scrollLeft += 12;
		}
		setDropTarget(targetAt(current));
		current.frame = requestAnimationFrame(() => track(current));
	}
	function activate(current: Gesture) {
		if (gesture.current !== current) return;
		current.active = true;
		skipClick.current = current.id;
		setDragging(current.id);
		track(current);
	}
	function stopGesture() {
		const current = gesture.current;
		if (!current) return;
		gesture.current = null;
		window.clearTimeout(current.timer);
		if (current.frame !== undefined) cancelAnimationFrame(current.frame);
		if (current.element.hasPointerCapture(current.pointer))
			current.element.releasePointerCapture(current.pointer);
		setDragging(undefined);
		setDropTarget(undefined);
	}
	useEffect(() => {
		const cancel = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape" && gesture.current) {
				event.preventDefault();
				stopGesture();
			}
		};
		window.addEventListener("keydown", cancel);
		window.addEventListener("blur", stopGesture);
		return () => {
			window.removeEventListener("keydown", cancel);
			window.removeEventListener("blur", stopGesture);
			stopGesture();
		};
	}, []);
	useEffect(() => {
		if (options.view !== "board") stopGesture();
	}, [options.view]);
	function beginDrag(event: PointerEvent<HTMLButtonElement>, projectId: string) {
		if (!event.isPrimary || event.button !== 0 || gesture.current) return;
		skipClick.current = undefined;
		const hold = event.pointerType === "touch";
		if (hold && !(event.target instanceof Element && event.target.closest("[data-project-grip]")))
			return;
		const { pointerId: pointer, clientX: x, clientY: y, currentTarget: element } = event;
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
		gesture.current = current;
		element.setPointerCapture(pointer);
		if (hold) current.timer = window.setTimeout(() => activate(current), 170);
	}
	function dragMove(event: PointerEvent) {
		const current = gesture.current;
		if (!current || current.pointer !== event.pointerId) return;
		current.x = event.clientX;
		current.y = event.clientY;
		const distance = Math.hypot(current.x - current.originX, current.y - current.originY);
		if (current.active) setDropTarget(targetAt(current));
		else if (event.pointerType === "touch" && distance > 8) {
			skipClick.current = current.id;
			stopGesture();
		} else if (event.pointerType !== "touch" && distance >= 6) activate(current);
	}
	function dragEnd(event: PointerEvent) {
		const current = gesture.current;
		if (!current || current.pointer !== event.pointerId) return;
		current.x = event.clientX;
		current.y = event.clientY;
		const target = current.active ? targetAt(current) : undefined;
		const project = projects.find((p) => p.id === current.id);
		stopGesture();
		if (target && project) move(project, target, "open");
	}

	const { pixels, months } = scales[options.scale];
	const first = monthOf(anchor, -months);
	const last = monthOf(anchor, months + 1);
	const width = (last - first) * pixels;
	const offset = (date: number) => (date - first) * pixels;
	const inRange = (date: number) => date >= first && date < last;
	const showList = options.projectList && visible.length > 0;
	const monthsShown = Array.from({ length: months * 2 + 1 }, (_, i) => monthOf(first, i));
	const tickStep = options.scale === "week" ? 1 : options.scale === "month" ? 7 : 14;
	const firstTick = tickStep === 1 ? first : first + ((4 - (first % 7) + 7) % 7);
	const ticks =
		options.scale === "year" && !options.weekNumbers
			? []
			: Array.from(
					{ length: Math.ceil((last - firstTick) / tickStep) },
					(_, n) => firstTick + n * tickStep
				);
	function midpoint(port: HTMLDivElement) {
		return (
			(port.clientWidth -
				(port.querySelector<HTMLElement>("[data-project-sidebar]")?.offsetWidth ?? 0)) /
			2
		);
	}
	function centeredDate() {
		const port = scrollport.current;
		return port ? first + Math.round((port.scrollLeft + midpoint(port)) / pixels) : today;
	}
	function centerOn(date: number) {
		setAnchor(date);
		setCenterRequest({ date });
	}
	useLayoutEffect(() => {
		const port = scrollport.current;
		if (port) port.scrollLeft = (centerRequest.date - first) * pixels - midpoint(port);
	}, [centerRequest, first, pixels, options.view, showList]);
	function zoom(scale: Scale) {
		if (scale !== options.scale) {
			const date = centeredDate();
			patchOptions({ scale });
			centerOn(date);
		}
	}
	function timelineKeys(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.nativeEvent.isComposing ||
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
	const lines = options.dependencies
		? visible.flatMap((p, index) =>
				(graph[p.id] ?? []).flatMap((blocker) => {
					const row = visible.findIndex((item) => item.id === blocker);
					const dates = row >= 0 ? endpoints(visible[row], p) : undefined;
					if (!dates || !inRange(dates.start) || !inRange(dates.end)) return [];
					const from = offset(dates.end + 1),
						to = offset(dates.start),
						elbow = (from + to) / 2;
					const violated = dates.end > dates.start;
					return [
						{
							id: `${blocker}:${p.id}`,
							violated,
							path: `M${from} ${AXIS + row * ROW + 41}H${elbow}V${AXIS + index * ROW + 41}H${to}`,
						},
					];
				})
			)
		: [];
	const emptyState = (
		<div className="grid min-h-[310px] place-content-center gap-3 p-4 text-center">
			<h3 className="font-medium">
				{activeFields.length ? "No projects matching the filters" : "No projects yet"}
			</h3>
			<p className="text-xs text-muted-foreground">
				{activeFields.length
					? `${projects.length} projects hidden by filters`
					: "Create a project to organize your team's work."}
			</p>
			<div>
				{activeFields.length ? (
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							patchOptions({ filters: {} });
							filterButton.current?.focus();
						}}
					>
						Clear filters
					</Button>
				) : (
					<Button size="sm" variant="outline" onClick={(e) => openDraft(e.currentTarget)}>
						Create first project
					</Button>
				)}
			</div>
		</div>
	);

	return (
		<section
			aria-label="Projects"
			className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-muted/20 text-sm text-foreground"
		>
			<PageLayout width="full" className="min-w-0 gap-0 p-0">
				<PageLayoutHeader className="flex min-h-11 flex-row items-center justify-between gap-2 border-b border-border px-4 py-1.5">
					<PageLayoutTitle tag="h2" className="text-[13px] font-medium">
						Projects
					</PageLayoutTitle>
					<Button
						ref={mainCreate}
						size="sm"
						variant="ghost"
						onClick={(e) => openDraft(e.currentTarget)}
					>
						<span aria-hidden="true">+</span> New project
					</Button>
				</PageLayoutHeader>
				<PageLayoutToolbar
					ref={toolbar}
					className="flex flex-wrap justify-between gap-2 px-3 py-2"
					onKeyDown={toolbarKeys}
				>
					<NativeSelect
						aria-label="Saved project views"
						size="sm"
						value={selectedView}
						onChange={(e) => applyView(e.target.value)}
						className="max-w-36 truncate rounded-full"
					>
						<NativeSelectOption value="all">All projects</NativeSelectOption>
						{saved.map((view) => (
							<NativeSelectOption key={view.id} value={view.id}>
								{view.name}
							</NativeSelectOption>
						))}
					</NativeSelect>
					<div className="flex flex-wrap items-center gap-1.5">
						<Popover
							open={filterOpen}
							onOpenChange={(open) => {
								setFilterOpen(open);
								if (open) setFilterField(undefined);
							}}
						>
							<PopoverTrigger asChild>
								<Button
									ref={filterButton}
									size="sm"
									variant="ghost"
									aria-label="Add filter"
									aria-keyshortcuts="F"
								>
									Filter
								</Button>
							</PopoverTrigger>
							<PopoverContent
								ref={filterPanel}
								appearance="surface"
								align="end"
								aria-label="Project filters"
								className="w-60 gap-0 p-1.5"
								onOpenAutoFocus={(e) => {
									e.preventDefault();
									filterPanel.current?.querySelector("input")?.focus();
								}}
							>
								{filterField && (
									<Button size="xs" variant="ghost" onClick={() => chooseField()}>
										‹ {labels[filterField]}
									</Button>
								)}
								<Choices
									key={filterField ?? "fields"}
									search="Search filters"
									options={
										filterField
											? choices[filterField]
											: fields.map((field) => ({ id: field, label: labels[field] }))
									}
									selected={filterField ? options.filters[filterField] : []}
									onSelect={(value) =>
										filterField ? toggleFilter(filterField, value) : chooseField(value as Field)
									}
								/>
							</PopoverContent>
						</Popover>
						<Popover open={displayOpen} onOpenChange={setDisplayOpen}>
							<PopoverTrigger asChild>
								<Button
									ref={displayButton}
									size="sm"
									variant="ghost"
									aria-keyshortcuts="Shift+V"
									aria-label="Display options"
								>
									Display
								</Button>
							</PopoverTrigger>
							<PopoverContent appearance="options" align="end" aria-label="Display options">
								<Tabs
									value={options.view}
									activationMode="manual"
									onValueChange={(mode) => {
										if (mode === "timeline") centerOn(today);
										patchOptions({ view: mode as Mode });
									}}
								>
									<div className="border-b border-border px-4 py-2">
										<TabsList aria-label="Project view" variant="capsule">
											{entries(modes).map(({ id: mode, label }) => (
												<TabsTrigger key={mode} value={mode}>
													{label}
												</TabsTrigger>
											))}
										</TabsList>
									</div>
									{(Object.keys(modes) as Mode[]).map((mode) => (
										<TabsContent key={mode} value={mode} className="grid gap-2 px-4 pt-2">
											{mode === "list" && (
												<p className="text-muted-foreground">Show projects in a sortable table.</p>
											)}
											{mode === "board" && (
												<p className="flex justify-between">
													Columns <span className="text-muted-foreground">Status</span>
												</p>
											)}
											{modeSwitches[mode].map((key) => (
												<div key={key} className="flex items-center justify-between gap-3">
													<span>{switches[key]}</span>
													<Switch
														aria-label={switches[key]}
														size="sm"
														appearance="settings"
														checked={options[key]}
														onCheckedChange={(checked) => {
															if (key === "projectList") centerOn(centeredDate());
															patchOptions({ [key]: checked });
														}}
													/>
												</div>
											))}
										</TabsContent>
									))}
								</Tabs>
								<div className="grid gap-2 px-4 py-2">
									<label className="flex items-center justify-between gap-2">
										Sort by{" "}
										<NativeSelect
											size="sm"
											value={options.order ?? ""}
											onChange={(e) =>
												patchOptions({ order: (e.target.value || undefined) as Order | undefined })
											}
										>
											<NativeSelectOption value="">Default</NativeSelectOption>
											{orders.map((key) => (
												<NativeSelectOption key={key} value={key}>
													{labels[key]}
												</NativeSelectOption>
											))}
										</NativeSelect>
									</label>
									{options.order && (
										<div className="flex justify-between gap-2">
											<span>Descending</span>
											<Switch
												aria-label="Descending"
												size="sm"
												checked={options.descending}
												onCheckedChange={(descending) => patchOptions({ descending })}
											/>
										</div>
									)}
								</div>
								<div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setViewName("");
											setSaveError("");
											setDisplayOpen(false);
											setSaveOpen(true);
										}}
									>
										Save current view
									</Button>
									{selectedView !== "all" && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												writeViews(saved.filter((v) => v.id !== selectedView));
												applyView("all");
												displayButton.current?.focus();
												setDisplayOpen(false);
											}}
										>
											Delete saved view
										</Button>
									)}
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</PageLayoutToolbar>
				{activeFields.length > 0 && (
					<div
						aria-label="Active filters"
						className="mx-2 mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-accent/50 p-2"
					>
						{activeFields.map((field) => (
							<div key={field} className="flex max-w-full items-center gap-1">
								<Picker
									label={`Edit ${labels[field]}`}
									options={choices[field]}
									selected={options.filters[field]}
									onSelect={(value) => toggleFilter(field, value)}
								>
									<span className="max-w-52 truncate">
										{labels[field]} is{" "}
										{options.filters[field]?.map((value) => projectLabel(field, value)).join(", ")}
									</span>
								</Picker>
								<Button
									size="icon-xs"
									variant="ghost"
									aria-label={`Remove ${labels[field]}`}
									onClick={() => {
										patchOptions({ filters: { ...options.filters, [field]: [] } });
										filterButton.current?.focus();
									}}
								>
									×
								</Button>
							</div>
						))}
						<Button
							size="xs"
							variant="ghost"
							className="ms-auto"
							onClick={() => {
								patchOptions({ filters: {} });
								filterButton.current?.focus();
							}}
						>
							Clear filters
						</Button>
					</div>
				)}
				{options.view === "list" &&
					(visible.length ? (
						<div className="min-h-[400px] min-w-0">
							<Table
								aria-label="Projects list"
								scrollLabel="Scroll projects list"
								className="min-w-[710px] table-fixed text-[13px]"
							>
								<TableHeader>
									<TableRow>
										{columns.map((column) => (
											<TableHead
												scope="col"
												key={column}
												className={
													column === "name"
														? "w-[33%] ps-4"
														: column === "target" || column === "status"
															? "w-[15%]"
															: undefined
												}
												aria-sort={
													options.order === column
														? options.descending
															? "descending"
															: "ascending"
														: undefined
												}
											>
												{orders.includes(column as Order) ? (
													<Button
														size="xs"
														variant="ghost"
														className="-ms-2"
														onClick={() =>
															patchOptions({
																order: column as Order,
																descending: options.order === column && !options.descending,
															})
														}
													>
														{labels[column]}
														{options.order === column && (
															<span aria-hidden="true">{options.descending ? "↓" : "↑"}</span>
														)}
													</Button>
												) : (
													labels[column]
												)}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{visible.map((project) => (
										<TableRow key={project.id} className="h-12">
											<TableCell className="ps-4">
												<Button
													size="sm"
													variant="ghost"
													className="max-w-full justify-start px-0 font-medium"
													onClick={(e) => openDetail(project, e.currentTarget)}
												>
													<ProjectIcon />
													<span className="truncate">{project.name}</span>
												</Button>
											</TableCell>
											<TableCell>
												<span
													role="img"
													aria-label="No updates"
													className="inline-block size-3.5 rounded-full border border-dashed border-muted-foreground/60"
												/>
											</TableCell>
											<TableCell>
												{project.priority === "none" ? "⋯" : priorities[project.priority]}
											</TableCell>
											<TableCell>
												<span title={projectLabel("lead", project.lead)}>
													<span className="sr-only">{projectLabel("lead", project.lead)}</span>
													<span aria-hidden="true">
														{people.find((p) => p.id === project.lead)?.initials ?? "–"}
													</span>
												</span>
											</TableCell>
											<TableCell>{project.target && dateLabel(project.target)}</TableCell>
											<TableCell>{project.issues}</TableCell>
											<TableCell>
												<span className="inline-flex items-center gap-1.5">
													<StatusDot status={project.status} />
													<span className="sr-only">{statuses[project.status]} · </span>
													{project.progress}%
												</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						emptyState
					))}
				{options.view === "board" &&
					(visible.length ? (
						<div
							ref={board}
							role="region"
							aria-label="Projects board"
							tabIndex={0}
							className={`flex min-h-[400px] min-w-0 gap-2 overflow-x-auto px-2 pb-3 ${focusClass}`}
							onPointerMove={dragMove}
							onPointerUp={dragEnd}
							onPointerCancel={stopGesture}
							onLostPointerCapture={stopGesture}
						>
							{statusChoices.map(({ id: key, label }) => {
								const status = key as Status;
								const group = visible.filter((p) => p.status === status);
								if (!group.length && !dragging && (!options.emptyColumns || status === "canceled"))
									return null;
								return (
									<section
										key={status}
										aria-label={label}
										data-project-column={status}
										data-drop-target={dropTarget === status ? "" : undefined}
										className="w-[min(345px,85vw)] shrink-0 rounded-lg bg-accent/35 px-2 pb-2 data-drop-target:bg-primary/10 data-drop-target:ring-1 data-drop-target:ring-primary/50 data-drop-target:ring-inset"
									>
										<header className="flex h-12 items-center gap-2 px-1 text-[13px]">
											<StatusDot status={status} />
											<h3 className="font-medium">{label}</h3>
											<span className="text-muted-foreground">{group.length}</span>
											<Button
												size="icon-xs"
												variant="ghost"
												className="ms-auto"
												aria-label={`New project in ${label}`}
												onClick={(e) => openDraft(e.currentTarget, status)}
											>
												+
											</Button>
										</header>
										<div className="space-y-2">
											{group.map((project) => (
												<article
													key={project.id}
													data-project-card={project.id}
													data-dragging={dragging === project.id ? "" : undefined}
													className="relative rounded-[10px] border border-border bg-card shadow-xs focus-within:border-ring/65 hover:bg-accent data-dragging:opacity-60"
												>
													<button
														type="button"
														data-project-card-open
														className={`block w-full cursor-grab rounded-[inherit] px-3 py-2.5 text-start text-[13px] select-none ${focusClass}`}
														onPointerDown={(e) => beginDrag(e, project.id)}
														onContextMenu={(e) => {
															if (
																gesture.current?.id === project.id ||
																skipClick.current === project.id
															)
																e.preventDefault();
														}}
														onClick={(e) => {
															if (skipClick.current === project.id && e.detail) {
																skipClick.current = undefined;
																return;
															}
															openDetail(project, e.currentTarget);
														}}
													>
														<span className="flex items-center gap-2 pe-7">
															<span className="touch-none" data-project-grip>
																<ProjectIcon />
															</span>
															<span className="min-w-0 flex-1 truncate font-medium">
																{project.name}
															</span>
															<StatusDot status={status} />
															{project.lead && (
																<span
																	title={projectLabel("lead", project.lead)}
																	className="rounded-full bg-info/15 p-1 text-[8px] text-info"
																>
																	{people.find((p) => p.id === project.lead)?.initials}
																</span>
															)}
														</span>
														{project.target && (
															<span className="mt-2 block text-xs text-muted-foreground">
																{dateLabel(project.target)}
															</span>
														)}
														<span className="mt-2 block text-xs text-muted-foreground">
															{project.issues} issues
														</span>
													</button>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																data-project-card-move
																aria-label={`Move project: ${project.name}`}
																size="icon-xs"
																variant="ghost"
																className="absolute end-2 top-2"
															>
																⠿
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent appearance="surface" align="end" className="w-40">
															{statusChoices.map(({ id: value, label: text }) => (
																<DropdownMenuItem
																	key={value}
																	disabled={value === status}
																	onSelect={() => move(project, value as Status, "move")}
																>
																	<StatusDot status={value as Status} />
																	{text}
																</DropdownMenuItem>
															))}
														</DropdownMenuContent>
													</DropdownMenu>
												</article>
											))}
										</div>
									</section>
								);
							})}
						</div>
					) : (
						emptyState
					))}
				{options.view === "timeline" && (
					<section
						aria-label="Projects timeline"
						data-scale={options.scale}
						className="min-w-0 border-t border-border"
						onKeyDown={timelineKeys}
					>
						<div className="flex flex-wrap justify-end gap-1 border-b border-border px-2 py-1.5">
							<Button
								size="icon-xs"
								variant="outline"
								aria-label="Previous period"
								onClick={() => centerOn(stepDate(centeredDate(), options.scale, -1))}
							>
								‹
							</Button>
							<Button
								size="icon-xs"
								variant="outline"
								aria-label="Next period"
								onClick={() => centerOn(stepDate(centeredDate(), options.scale, 1))}
							>
								›
							</Button>
							<Button
								size="xs"
								variant="outline"
								aria-keyshortcuts="T"
								onClick={() => centerOn(today)}
							>
								Today
							</Button>
							<NativeSelect
								size="sm"
								aria-label="Timeline zoom"
								value={options.scale}
								onChange={(e) => zoom(e.target.value as Scale)}
							>
								{(Object.keys(scales) as Scale[]).map((scale) => (
									<NativeSelectOption key={scale} value={scale}>
										{scales[scale].label}
									</NativeSelectOption>
								))}
							</NativeSelect>
						</div>
						<div
							ref={scrollport}
							role="region"
							aria-label="Scroll project dates"
							tabIndex={0}
							className={`min-w-0 overflow-x-auto ${focusClass}`}
						>
							<div
								className="relative grid min-h-[44px] w-max min-w-full auto-rows-min content-start [--project-sidebar:120px] sm:[--project-sidebar:224px]"
								style={{
									gridTemplateColumns: `${showList ? "var(--project-sidebar)" : "0px"} ${width}px`,
								}}
							>
								<div
									className="pointer-events-none absolute inset-y-0 col-start-2"
									aria-hidden="true"
								>
									{monthsShown.map((date) => (
										<div
											key={date}
											className="absolute inset-y-0 border-s border-dashed border-border"
											style={{ left: offset(date) }}
										/>
									))}
									{inRange(today) && (
										<div
											className="absolute inset-y-0 border-s border-primary/65"
											style={{ left: offset(today) }}
										/>
									)}
								</div>
								{lines.length > 0 && (
									<svg
										aria-hidden="true"
										className="pointer-events-none absolute top-0 z-10 col-start-2"
										width={width}
										height={AXIS + visible.length * ROW}
									>
										{lines.map((line) => (
											<path
												key={line.id}
												data-project-dependency={line.id}
												data-violated={line.violated}
												d={line.path}
												stroke="currentColor"
												strokeWidth="1.5"
												fill="none"
												className={line.violated ? "text-destructive" : "text-info"}
											/>
										))}
									</svg>
								)}
								<div
									data-project-sidebar
									className="sticky start-0 z-20 col-start-1 row-start-1 h-11 bg-background"
								/>
								<div
									aria-hidden="true"
									className="relative col-start-2 row-start-1 h-11 border-b border-border text-[11px] text-muted-foreground"
								>
									{monthsShown.map((date) => (
										<span
											key={date}
											className="absolute top-1.5 truncate px-1.5 font-medium uppercase"
											style={{ left: offset(date), width: offset(monthOf(date, 1)) - offset(date) }}
										>
											{monthLabel.format(date * DAY)}{" "}
											{new Date(date * DAY).getUTCMonth() === 0 ? iso(date).slice(0, 4) : ""}
										</span>
									))}
									{ticks.map((date) => {
										const utc = new Date(date * DAY);
										const monday = ((date % 7) + 7) % 7 === 4;
										const thursday = date + 3;
										const jan4 = day(`${iso(thursday).slice(0, 4)}-01-04`);
										const firstMonday = jan4 - ((((jan4 - 4) % 7) + 7) % 7);
										return (
											<span
												key={date}
												className="absolute bottom-1 border-s border-border/75 px-1 text-[10px]"
												style={{ left: offset(date) }}
											>
												{options.weekNumbers && (options.scale !== "week" || monday)
													? `W${1 + Math.floor((date - firstMonday) / 7)}`
													: utc.getUTCDate()}
											</span>
										);
									})}
									{inRange(today) && (
										<span
											className="absolute bottom-1 -translate-x-1/2 rounded-full bg-primary px-1.5 text-[10px] whitespace-nowrap text-primary-foreground"
											style={{ left: offset(today) }}
										>
											{dateLabel({ date: iso(today), grain: "day" })}
										</span>
									)}
								</div>
								{visible.map((project) => {
									const start = project.start && day(project.start.date),
										end = project.target && day(timeframeEnd(project.target));
									const left = Math.max(0, offset(start ?? (end === undefined ? today : end - 13)));
									const right = Math.min(
										width,
										offset((end ?? (start === undefined ? today + 9 : start + 13)) + 1)
									);
									const dated = start !== undefined || end !== undefined;
									return (
										<Fragment key={project.id}>
											<div className="sticky start-0 z-20 col-start-1 h-[72px] min-w-0 border-b border-border bg-background">
												{showList && (
													<button
														type="button"
														aria-label={project.name}
														className={`flex h-full w-full items-center gap-1.5 px-2 text-start text-[13px] hover:bg-accent ${focusClass}`}
														onClick={(e) => openDetail(project, e.currentTarget, true)}
													>
														<ProjectIcon />
														<span className="min-w-0 flex-1 truncate" title={project.name}>
															{project.name}
														</span>
														<StatusDot status={project.status} />
													</button>
												)}
											</div>
											<div className="relative col-start-2 h-[72px] border-b border-border/60">
												{right > left && (
													<>
														<span
															aria-hidden="true"
															className="absolute top-2 max-w-56 truncate"
															style={{ left, maxWidth: Math.min(224, width - left) }}
														>
															{project.name}
														</span>
														<button
															type="button"
															data-project-bar={project.id}
															data-dated={dated}
															aria-label={`${project.name} · ${dated ? `${project.start ? dateLabel(project.start) : "No start date"} – ${project.target ? dateLabel(project.target) : "No target date"}` : "Unscheduled"}`}
															className={`absolute top-7 h-[26px] overflow-hidden rounded-md border border-border bg-card hover:border-primary/65 ${!dated ? "border-dashed" : ""} ${focusClass}`}
															style={{
																left,
																width: Math.min(Math.max(20, right - left), width - left),
															}}
															onClick={(e) => openDetail(project, e.currentTarget)}
														>
															{!project.start && (
																<span className="absolute inset-y-0 start-0 w-1/3 bg-linear-to-r from-muted to-transparent" />
															)}
															{!project.target && (
																<span className="absolute inset-y-0 end-0 w-1/3 bg-linear-to-l from-muted to-transparent" />
															)}
															{project.progress > 0 && (
																<span
																	className="absolute inset-y-0 start-0 bg-primary/20"
																	style={{ width: `${project.progress}%` }}
																/>
															)}
														</button>
													</>
												)}
												{options.milestones &&
													project.milestones
														?.filter((m) => inRange(day(m.date)))
														.map((m) => (
															<div
																key={m.id}
																className="absolute top-7 z-10 -translate-x-1/2"
																style={{ left: offset(day(m.date)) }}
															>
																<Popover>
																	<PopoverTrigger asChild>
																		<Button
																			size="icon-xs"
																			variant="ghost"
																			aria-label={`Milestone: ${m.name}`}
																			title={`${m.name} · ${m.date}`}
																		>
																			<span
																				aria-hidden="true"
																				className={`size-2 rotate-45 rounded-[1px] border ${m.progress === 100 ? "border-success bg-success/30" : "border-warning bg-warning/30"}`}
																			/>
																		</Button>
																	</PopoverTrigger>
																	<PopoverContent
																		appearance="surface"
																		aria-label={m.name}
																		className="w-52 gap-1 p-3 text-xs"
																	>
																		<strong>{m.name}</strong>
																		<span className="text-muted-foreground">
																			{dateLabel({ date: m.date, grain: "day" })} · {m.progress}%
																			complete
																		</span>
																		<DatePicker
																			label="Edit milestone date"
																			value={{ date: m.date, grain: "day" }}
																			precisions={["day"]}
																			allowClear={false}
																			onValueChange={(value) => {
																				if (!value) return;
																				updateProject(project.id, {
																					milestones: project.milestones?.map((item) =>
																						item.id === m.id ? { ...item, date: value.date } : item
																					),
																				});
																				if (!inRange(day(value.date))) centerOn(day(value.date));
																			}}
																		/>
																	</PopoverContent>
																</Popover>
																{options.scale === "week" && (
																	<span
																		aria-hidden="true"
																		className="pointer-events-none absolute top-6 left-1/2 max-w-24 -translate-x-1/2 truncate text-[10px] text-muted-foreground"
																	>
																		{m.name}
																	</span>
																)}
															</div>
														))}
											</div>
										</Fragment>
									);
								})}
							</div>
						</div>
						{!visible.length && emptyState}
					</section>
				)}
				{detail && (
					<aside
						aria-label="Project details"
						className="min-w-0 border-t border-border bg-card px-4 py-3"
					>
						<div className="flex items-center justify-between gap-2">
							<h3 className="font-semibold break-words">{detail.name}</h3>
							<Button
								size="icon-xs"
								variant="ghost"
								aria-label="Close project details"
								onClick={() => {
									setDetailId(undefined);
									(detailOpener.current?.isConnected
										? detailOpener.current
										: displayButton.current
									)?.focus();
								}}
							>
								×
							</Button>
						</div>
						{detail.summary && (
							<p className="break-words text-muted-foreground">{detail.summary}</p>
						)}
						{detail.description && (
							<p className="mt-2 break-words whitespace-pre-wrap">{detail.description}</p>
						)}
						<Collapsible key={detail.id} appearance="properties" defaultOpen className="mt-2">
							<CollapsibleTrigger>Properties</CollapsibleTrigger>
							<CollapsibleContent className="space-y-3 px-2 py-2">
								<p className="text-xs text-muted-foreground">
									{statuses[detail.status]} ·{" "}
									{detail.teams.map((team) => projectLabel("team", team)).join(", ")} ·{" "}
									{projectLabel("lead", detail.lead)}
								</p>
								<div className="flex flex-wrap gap-2">
									<DatePicker
										label="Edit start date"
										placeholder="Set start date"
										value={detail.start}
										max={detail.target}
										onValueChange={(start) => updateProject(detail.id, { start })}
									/>
									<DatePicker
										label="Edit target date"
										placeholder="Set target date"
										value={detail.target}
										min={detail.start}
										onValueChange={(target) => updateProject(detail.id, { target })}
									/>
								</div>
								<div className="space-y-1 text-xs">
									<Picker
										label="Edit blocking projects"
										search="Search projects"
										options={projects
											.filter((p) => canAdd(graph, detail.id, p.id))
											.map((p) => ({ id: p.id, label: p.name }))}
										empty="No available blockers"
										selected={graph[detail.id] ?? []}
										onSelect={(blocker) => toggleDependency(detail.id, blocker)}
									>
										Blocked by{graph[detail.id]?.length ? ` · ${graph[detail.id]?.length}` : ""}
									</Picker>
									{projects
										.filter((p) => graph[detail.id]?.includes(p.id))
										.map((p) => {
											const dates = endpoints(p, detail);
											return (
												<p key={p.id} className="text-muted-foreground">
													{p.name}
													{dates && dates.end > dates.start && (
														<span className="text-destructive"> · Schedule conflict</span>
													)}
												</p>
											);
										})}
									{projects.some((p) => graph[p.id]?.includes(detail.id)) && (
										<p className="text-muted-foreground">
											Blocking ·{" "}
											{projects
												.filter((p) => graph[p.id]?.includes(detail.id))
												.map((p) => p.name)
												.join(", ")}
										</p>
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					</aside>
				)}
			</PageLayout>
			<span role="status" className="sr-only">
				{announcement}
			</span>
			<Dialog open={saveOpen} onOpenChange={setSaveOpen}>
				<DialogContent
					closeLabel="Close saved view form"
					className="max-w-[min(24rem,calc(100vw-2rem))]"
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						displayButton.current?.focus();
					}}
				>
					<DialogTitle>Save project view</DialogTitle>
					<DialogDescription>
						Save the current filters, sort, and display options.
					</DialogDescription>
					<form className="space-y-3" onSubmit={saveView}>
						<label htmlFor={`${id}-view`}>View name</label>
						<Input
							id={`${id}-view`}
							value={viewName}
							maxLength={60}
							aria-invalid={!!saveError}
							aria-describedby={saveError ? `${id}-view-error` : undefined}
							onChange={(event) => {
								setViewName(event.target.value);
								setSaveError("");
							}}
						/>
						{saveError && (
							<p id={`${id}-view-error`} role="alert" className="text-xs text-destructive">
								{saveError}
							</p>
						)}
						<div className="flex justify-end gap-2">
							<Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
								Cancel
							</Button>
							<Button type="submit">Save view</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			<Dialog
				open={!!draft}
				onOpenChange={(open) => {
					if (!open) closeDraft();
				}}
			>
				<DialogContent
					showCloseButton={false}
					className="h-[min(750px,88svh)] w-[calc(100%-24px)] max-w-[920px] gap-0 rounded-[21px] p-0 sm:max-w-[920px]"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						document.getElementById(nameInputId)?.focus();
					}}
					onCloseAutoFocus={(e) => {
						e.preventDefault();
						(draftOpener.current?.isConnected ? draftOpener.current : mainCreate.current)?.focus();
					}}
				>
					{draft && (
						<form className="flex min-h-0 flex-col" onSubmit={submitProject}>
							<header className="flex min-h-14 shrink-0 items-center gap-2 px-4 sm:px-6">
								<Picker
									label="Project teams"
									search="Search teams"
									options={teamChoices}
									selected={draft.teams}
									disabled={singleTeam}
									portal={draftPortal}
									onSelect={toggleTeam}
								>
									{projectLabel("team", draft.teams[0])}
									{draft.teams.length > 1 ? ` +${draft.teams.length - 1}` : ""}
								</Picker>
								<span aria-hidden="true" className="text-muted-foreground">
									›
								</span>
								<DialogTitle className="text-[13px] font-medium">New project</DialogTitle>
								<DialogDescription className="sr-only">
									Set the project name, properties, and dates.
								</DialogDescription>
								<Button
									type="button"
									size="icon-sm"
									variant="ghost"
									className="ms-auto"
									aria-label="Close project form"
									onClick={closeDraft}
								>
									×
								</Button>
							</header>
							<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-3 sm:px-[26px]">
								<ProjectIcon />
								<Input
									id={nameInputId}
									value={draft.name}
									aria-label="Project name"
									placeholder="Project name"
									aria-required="true"
									aria-invalid={invalidName}
									aria-describedby={invalidName ? `${id}-name-error` : undefined}
									maxLength={120}
									className="shrink-0 text-2xl md:text-2xl"
									onChange={(e) => {
										setInvalidName(false);
										patchDraft({ name: e.target.value });
									}}
								/>
								{invalidName && (
									<p id={`${id}-name-error`} role="alert" className="text-xs text-destructive">
										Enter a project name.
									</p>
								)}
								<Input
									value={draft.summary}
									aria-label="Project summary"
									placeholder="Add a short summary…"
									maxLength={240}
									onChange={(e) => patchDraft({ summary: e.target.value })}
								/>
								<div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
									<NativeSelect
										size="sm"
										aria-label="Project status"
										value={draft.status}
										onChange={(e) => patchDraft({ status: e.target.value as Status })}
									>
										{statusChoices.map((choice) => (
											<NativeSelectOption key={choice.id} value={choice.id}>
												{choice.label}
											</NativeSelectOption>
										))}
									</NativeSelect>
									<NativeSelect
										size="sm"
										aria-label="Project priority"
										value={draft.priority}
										onChange={(e) => patchDraft({ priority: e.target.value as Draft["priority"] })}
									>
										{priorityChoices.map((choice) => (
											<NativeSelectOption key={choice.id} value={choice.id}>
												{choice.label}
											</NativeSelectOption>
										))}
									</NativeSelect>
									<NativeSelect
										size="sm"
										aria-label="Project lead"
										value={draft.lead}
										onChange={(e) => patchDraft({ lead: e.target.value })}
									>
										<NativeSelectOption value="">No lead</NativeSelectOption>
										{people
											.filter((p) => draft.teams.includes(p.team))
											.map((p) => (
												<NativeSelectOption key={p.id} value={p.id}>
													{p.name}
												</NativeSelectOption>
											))}
									</NativeSelect>
									<DatePicker
										label="Start date"
										placeholder="Start"
										value={draft.start}
										max={draft.target}
										portalProps={{ container: draftPortal }}
										onValueChange={(start) => patchDraft({ start })}
									/>
									<DatePicker
										label="Target date"
										placeholder="Target"
										value={draft.target}
										min={draft.start}
										portalProps={{ container: draftPortal }}
										onValueChange={(target) => patchDraft({ target })}
									/>
								</div>
								<Textarea
									value={draft.description}
									aria-label="Project description"
									placeholder="Write a description, a project brief, or collect ideas…"
									className="min-h-28 flex-1 resize-none"
									onChange={(e) => patchDraft({ description: e.target.value })}
								/>
							</div>
							<footer className="flex min-h-[60px] shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-4 sm:px-6">
								{invalidRange && (
									<p role="alert" className="text-xs text-destructive">
										Target date cannot precede the start date.
									</p>
								)}
								<Button type="submit" size="sm" disabled={!!invalidRange}>
									Create project
								</Button>
							</footer>
						</form>
					)}
					<div ref={setDraftPortal} />
					<AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
						<AlertDialogContent
							className="z-[60]"
							onCloseAutoFocus={(e) => {
								e.preventDefault();
								if (discardConfirmed.current) {
									discardConfirmed.current = false;
									setDraft(undefined);
								} else
									(discardOpener.current?.isConnected
										? discardOpener.current
										: document.getElementById(nameInputId)
									)?.focus();
							}}
						>
							<AlertDialogTitle>Discard changes?</AlertDialogTitle>
							<AlertDialogDescription>Your project draft will be cleared.</AlertDialogDescription>
							<div className="flex flex-wrap justify-end gap-2">
								<AlertDialogCancel>Keep editing</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => {
										discardConfirmed.current = true;
										setDiscardOpen(false);
									}}
								>
									Discard
								</AlertDialogAction>
							</div>
						</AlertDialogContent>
					</AlertDialog>
				</DialogContent>
			</Dialog>
		</section>
	);
}
