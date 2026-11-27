"use client";

import * as React from "react";
import { Button } from "./button.tsx";
import { Input } from "./input.tsx";
import {
	applyLink,
	createIssueEditor,
	format,
	isComposing,
	richNodes,
	tools,
} from "./issue-detail-editor-core.ts";
import { richTextClass } from "./issue-detail-model.ts";
import type { Editor, JSONContent } from "@tiptap/core";

export function RichDescription({
	content,
	slot = "issue-description",
}: {
	content: JSONContent;
	slot?: string;
}) {
	return (
		<div data-slot={slot} className={richTextClass}>
			{richNodes(content, (tag, attrs, children) => React.createElement(tag, attrs, ...children))}
		</div>
	);
}

type EditorProps = {
	editor: React.RefObject<Editor | null>;
	content: JSONContent;
	chinese: boolean;
	focusOnMount: boolean;
	commentLabel?: string;
	commentPlaceholder?: string;
	onKeys?: (event: KeyboardEvent) => boolean;
	onChange: (editor: Editor) => void;
};

export function DescriptionEditor(props: EditorProps) {
	const { editor, chinese, commentLabel, commentPlaceholder } = props;
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const id = React.useId();
	const host = React.useRef<HTMLDivElement>(null);
	const linkInput = React.useRef<HTMLInputElement>(null);
	const [toolbar, setToolbar] = React.useState<string[]>([]);
	const [linkOpen, setLinkOpen] = React.useState(false);
	const [linkValue, setLinkValue] = React.useState("");
	const [invalid, setInvalid] = React.useState(false);
	const start = React.useRef(props);
	const label = commentLabel ?? t("问题描述", "Issue description");

	function openLink() {
		setLinkValue(editor.current?.getAttributes("link").href ?? "");
		setInvalid(false);
		setLinkOpen(true);
	}
	function closeLink() {
		setLinkOpen(false);
		editor.current?.commands.focus();
	}
	function saveLink() {
		if (!editor.current) return;
		if (applyLink(editor.current, linkValue)) closeLink();
		else {
			setInvalid(true);
			linkInput.current?.focus();
		}
	}

	const onChange = React.useEffectEvent((instance: Editor) => props.onChange(instance));
	const onKeys = React.useEffectEvent((event: KeyboardEvent) => {
		if (props.onKeys?.(event)) return true;
		if (
			event.key.toLowerCase() === "k" &&
			(event.ctrlKey || event.metaKey) &&
			!isComposing(event)
		) {
			event.preventDefault();
			if (!event.repeat) openLink();
			return true;
		}
		return false;
	});
	React.useEffect(() => {
		if (!host.current) return;
		const { content, focusOnMount } = start.current;
		const instance = createIssueEditor({
			element: host.current,
			content,
			label: "",
			comment: !!start.current.commentLabel,
			focus: focusOnMount,
			onChange: (current) => onChange(current),
			onKeys: (event) => onKeys(event),
			onFormats: setToolbar,
		});
		editor.current = instance;
		return () => {
			instance.destroy();
			if (editor.current === instance) editor.current = null;
		};
	}, [editor]);
	React.useEffect(() => {
		editor.current?.view.dom.setAttribute("aria-label", label);
	}, [editor, label]);
	React.useLayoutEffect(() => {
		if (linkOpen) linkInput.current?.focus();
	}, [linkOpen]);

	return (
		<div
			className={commentLabel ? "min-w-0" : "rounded-lg border border-border bg-(--detail-control)"}
		>
			{!commentLabel && (
				<div
					role="group"
					aria-label={t("文本格式", "Text formatting")}
					className="flex flex-wrap gap-0.5 border-b border-border p-1"
				>
					{tools.map((tool) => (
						<Button
							key={tool.key}
							variant="ghost"
							size="icon-xs"
							type="button"
							className={`h-6 min-w-6 px-1 text-xs text-muted-foreground aria-pressed:bg-accent aria-pressed:text-foreground ${tool.class}`}
							aria-label={t(tool.zh, tool.en)}
							title={t(tool.zh, tool.en)}
							aria-keyshortcuts={"shortcut" in tool ? tool.shortcut : undefined}
							aria-pressed={toolbar.includes(tool.key)}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => editor.current && format(editor.current, tool.key)}
						>
							{tool.symbol}
						</Button>
					))}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 px-2 text-xs text-muted-foreground aria-pressed:bg-accent"
						aria-expanded={linkOpen}
						aria-pressed={toolbar.includes("link")}
						aria-keyshortcuts="Meta+K Control+K"
						onMouseDown={(event) => event.preventDefault()}
						onClick={openLink}
					>
						{t("链接", "Link")}
					</Button>
				</div>
			)}
			{linkOpen && (
				<div className="border-b border-border p-2">
					<div className="flex flex-wrap items-center gap-1.5">
						<Input
							ref={linkInput}
							value={linkValue}
							aria-label={t("链接地址", "Link address")}
							aria-invalid={invalid}
							aria-describedby={invalid ? `${id}-link-error` : undefined}
							placeholder="https://"
							className="h-7 min-w-0 flex-1"
							onChange={(event) => {
								setLinkValue(event.currentTarget.value);
								setInvalid(false);
							}}
							onKeyDown={(event) => {
								if (
									isComposing(event.nativeEvent) ||
									(event.key !== "Enter" && event.key !== "Escape")
								)
									return;
								event.preventDefault();
								event.stopPropagation();
								if (!event.repeat) event.key === "Enter" ? saveLink() : closeLink();
							}}
						/>
						<Button type="button" variant="ghost" size="xs" onClick={closeLink}>
							{t("关闭链接输入", "Close link input")}
						</Button>
						<Button type="button" variant="outline" size="xs" onClick={saveLink}>
							{t("应用链接", "Apply link")}
						</Button>
					</div>
					{invalid && (
						<p id={`${id}-link-error`} role="alert" className="mt-1 text-xs text-destructive">
							{t(
								"请输入有效的 HTTP、HTTPS 或邮件链接。",
								"Enter a valid HTTP, HTTPS, or mailto link."
							)}
						</p>
					)}
				</div>
			)}
			<div className="relative">
				{commentPlaceholder && (
					<span
						aria-hidden="true"
						className="pointer-events-none absolute start-0 top-0 text-[15px] leading-6 text-(--activity-placeholder)"
					>
						{commentPlaceholder}
					</span>
				)}
				<div
					ref={host}
					className={`${richTextClass} ${commentLabel ? "focus-within:outline-1 focus-within:-outline-offset-1 focus-within:outline-ring" : "p-3 focus-within:outline-1 focus-within:-outline-offset-1 focus-within:outline-ring"}`}
				/>
			</div>
		</div>
	);
}
