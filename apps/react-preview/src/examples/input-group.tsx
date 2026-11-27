import { Field, FieldLabel } from "@valar/react-ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "@valar/react-ui/input-group";
import { useId, useRef, useState } from "react";

const settings = ["Profile", "Preferences", "Notifications"];

export default function InputGroupExample() {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const matches = settings.filter((setting) =>
		setting.toLowerCase().includes(query.trim().toLowerCase())
	);

	function clear() {
		setQuery("");
		input.current?.focus();
	}

	return (
		<section aria-label="Input Group examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<div className="grid w-full max-w-42 gap-2">
				<InputGroup appearance="settings-search">
					<InputGroupInput
						ref={input}
						type="search"
						aria-label="Search settings"
						aria-controls={`${id}-results`}
						placeholder="Search…"
						value={query}
						onChange={(event) => setQuery(event.currentTarget.value)}
						onKeyDown={(event) => {
							if (event.key === "Escape" && query && !event.nativeEvent.isComposing) {
								event.preventDefault();
								event.stopPropagation();
								clear();
							}
						}}
					/>
					<InputGroupAddon aria-hidden="true">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						>
							<circle cx="11" cy="11" r="7" />
							<path d="m20 20-4-4" />
						</svg>
					</InputGroupAddon>
					<InputGroupAddon align="inline-end">
						{query && (
							<InputGroupButton size="icon-xs" aria-label="Clear search" onClick={clear}>
								<svg
									aria-hidden="true"
									className="size-3"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								>
									<path d="m18 6-12 12M6 6l12 12" />
								</svg>
							</InputGroupButton>
						)}
					</InputGroupAddon>
				</InputGroup>
				<div id={`${id}-results`} aria-live="polite" className="text-xs text-muted-foreground">
					{matches.length ? (
						<ul className="grid gap-1">
							{matches.map((setting) => (
								<li key={setting}>{setting}</li>
							))}
						</ul>
					) : (
						<p>No matching settings</p>
					)}
				</div>
			</div>
			<Field>
				<FieldLabel htmlFor={`${id}-slug`}>Workspace URL</FieldLabel>
				<InputGroup>
					<InputGroupAddon aria-hidden="true">
						<InputGroupText>valar.dev/</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput id={`${id}-slug`} defaultValue="design" />
				</InputGroup>
			</Field>
		</section>
	);
}
