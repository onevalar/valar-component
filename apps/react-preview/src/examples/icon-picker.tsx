import { createParts } from "@ui-sdk/react/primitive";
import { iconPicker } from "../../../framework-comparison/src/icon-picker.js";
import "../../../framework-comparison/src/icon-picker.css";

const { Root, Trigger, Content, Search, Results, Item, Selection } = createParts(iconPicker, {
	trigger: "button",
	content: "div",
	search: "input",
	results: "div",
	item: "button",
	selection: "p",
});

function Glyph({ path }: { path: string }) {
	return (
		<svg
			aria-hidden="true"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={path} />
		</svg>
	);
}

export default function IconPickerExample() {
	return (
		<main className="icon-picker-preview">
			<h1>Project settings</h1>
			<Root>
				<div className="icon-picker-setting">
					<div>
						<span>Project icon</span>
						<Selection className="icon-picker-selection">
							{({ name }) => `Selected icon: ${name}`}
						</Selection>
					</div>
					<Trigger aria-label="Choose project icon" className="icon-picker-trigger">
						{({ selected }) => <Glyph path={selected.path} />}
					</Trigger>
				</div>
				<Content
					align="end"
					sideOffset={8}
					collisionPadding={8}
					initialFocus="input[type=search]"
					className="icon-picker-panel"
				>
					<Search />
					<Results className="icon-picker-results">
						{({ results }) =>
							results.length ? (
								results.map(({ name, path }) => (
									<Item
										key={name}
										value={name}
										aria-label={name}
										title={name}
										className="icon-picker-item"
									>
										<Glyph path={path} />
									</Item>
								))
							) : (
								<p className="icon-picker-empty">No icons found</p>
							)
						}
					</Results>
				</Content>
			</Root>
		</main>
	);
}
