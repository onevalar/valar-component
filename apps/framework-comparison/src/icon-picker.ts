import {
	createPopup,
	createRovingFocus,
	definePrimitive,
	popupContent,
	popupState,
	popupTrigger,
	spatialMove,
} from "@ui-sdk/core";
import { popoverPreset } from "@ui-sdk/core/popover";
import { fuzzyScore } from "@ui-sdk/core/text-match";

// The preview uses a fixed catalog so all three renderers exercise the same data.
const icons = [
	{
		name: "Folder",
		keyword: "files",
		path: "M2 7V5a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z",
	},
	{
		name: "Star",
		keyword: "favorite",
		path: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
	},
	{
		name: "Heart",
		keyword: "love",
		path: "M20.8 8a4.7 4.7 0 0 0-8-3.3L12 5.5l-.8-.8a4.7 4.7 0 0 0-6.6 6.6L12 19l7.4-7.7A4.7 4.7 0 0 0 20.8 8Z",
	},
	{ name: "Flag", keyword: "milestone", path: "M4 22V3m0 2c5-5 10 4 16 0v11c-6 4-11-5-16 0" },
	{ name: "Moon", keyword: "night", path: "M20.8 15.1A9 9 0 0 1 8.9 3.2 9 9 0 1 0 20.8 15.1Z" },
	{
		name: "Rocket",
		keyword: "launch",
		path: "M12 16 8 12m4 4c6-2 9-7 9-13-6 0-11 3-13 9m4 4-1 5 5-2 1-5m-9-2-5 1 2-5 5-1m6 1h.01M7 17c-2 0-3 2-3 3 1 0 3-1 3-3Z",
	},
	{
		name: "Lightbulb",
		keyword: "idea",
		path: "M9 18h6m-5 4h4m-5-7c0-2-4-3-4-7a7 7 0 0 1 14 0c0 4-4 5-4 7Z",
	},
	{ name: "Bolt", keyword: "energy", path: "m13 2-9 12h7l-1 8 10-12h-7Z" },
	{ name: "Diamond", keyword: "shape", path: "m12 2 10 10-10 10L2 12Z" },
	{ name: "Circle", keyword: "shape", path: "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0Z" },
	{
		name: "Square",
		keyword: "shape",
		path: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
	},
	{ name: "Triangle", keyword: "shape", path: "m12 3 10 18H2Z" },
];

function search(query: string) {
	if (!query.trim()) return icons;
	return icons
		.map((icon) => ({
			icon,
			score: Math.max(fuzzyScore(icon.name, query.trim()), fuzzyScore(icon.keyword, query.trim())),
		}))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.map(({ icon }) => icon);
}

export const iconPicker = definePrimitive({
	name: "icon-picker",
	options: { defaultOpen: "boolean" },
	state: (options: { defaultOpen?: boolean }) => ({
		...popupState(options),
		selected: icons[0]!,
		query: "",
		results: icons,
		focused: null as string | null,
	}),
	api: (context) => {
		const popup = createPopup(context, { preset: popoverPreset });
		const roving = createRovingFocus(context, {
			slot: "item",
			key: "focused",
			preferred: (item) => item.key === context.store.get().selected.name,
			orientation: () => "both",
			move: spatialMove(),
		});
		function select(name: string, event?: Event) {
			const selected = icons.find((icon) => icon.name === name);
			if (selected && popup.close({ reason: "close-press", event })) {
				context.store.set({ selected, query: "", results: icons, focused: null });
			}
		}
		return {
			...popup,
			roving,
			select,
			search(query: string) {
				context.store.set({ query, results: search(query), focused: null });
			},
			searchKey(event: KeyboardEvent) {
				if (event.isComposing) return;
				const first = context.store.get().results[0];
				if (event.key === "Enter" || (event.key === "ArrowDown" && first)) {
					event.preventDefault();
					if (!first) return;
					if (event.key === "Enter") select(first.name, event);
					else roving.focus(first.name);
				}
			},
		};
	},
	slots: (slot) => {
		const trigger = popupTrigger(slot);
		return {
			trigger: slot({
				...trigger,
				state: (state) => ({ selected: state.selected }),
			}),
			content: popupContent(slot),
			search: slot({
				attrs: (state) => ({
					type: "search",
					value: state.query,
					"aria-label": "Search icons",
					placeholder: "Search icons…",
				}),
				on: {
					input: (_, { el, api }) => {
						if (el instanceof HTMLInputElement) api.search(el.value);
					},
					keydown: (event, { api }) => api.searchKey(event),
				},
			}),
			results: slot({
				state: (state) => ({ results: state.results }),
				attrs: () => ({ role: "group", "aria-label": "Available icons" }),
			}),
			item: slot<{ value: string }>({
				props: { value: "string" },
				attrs: (state, part) => ({
					type: "button",
					"aria-pressed": String(state.selected.name === part.key),
					tabindex: part.api.roving.tabIndex(state, part),
				}),
				press: ({ api, key }, event) => api.select(key, event),
				on: {
					keydown: (event, { api, el }) => {
						if (el) api.roving.keydown(event, el);
					},
				},
				bind: (el, part) => part.api.roving.bind(el, part),
			}),
			selection: slot({
				state: (state) => ({ name: state.selected.name }),
				attrs: () => ({ role: "status", "aria-atomic": "true" }),
			}),
		};
	},
});
