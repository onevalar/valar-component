"use client";

import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Check, Copy } from "lucide-react";
import React, { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import type { createCodeStream, HighlightedLine } from "#code-highlighter";
import { Button, type ButtonProps } from "./button.tsx";

export type CodeBlockVariant = "default" | "destructive";
export type CodeBlockSize = "default" | "sm";
export type CodeBlockLineVariant = "default" | "added" | "removed" | "highlighted";
export type CodeBlockLineToken = { content: string; style?: CSSProperties; className?: string };

export const codeBlockVariants = cva(
	"cn-code-block group/code-block relative flex w-full min-w-0 flex-col overflow-hidden",
	{
		variants: { variant: { default: "cn-code-block-variant-default", destructive: "cn-code-block-variant-destructive" } },
		defaultVariants: { variant: "default" },
	}
);
export const codeBlockLineVariants = cva(
	"cn-code-block-line relative block min-h-lh after:absolute after:top-0 after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
	{
		variants: { variant: {
			default: "cn-code-block-line-variant-default",
			added: "cn-code-block-line-variant-added",
			removed: "cn-code-block-line-variant-removed",
			highlighted: "cn-code-block-line-variant-highlighted",
		} },
		defaultVariants: { variant: "default" },
	}
);

export type CodeBlockProps = ComponentProps<"div"> & { variant?: CodeBlockVariant; size?: CodeBlockSize };

export function CodeBlock({ variant = "default", size = "default", className, ...props }: CodeBlockProps) {
	return <div data-slot="code-block" data-variant={variant} data-size={size} className={cn(codeBlockVariants({ variant }), className)} {...props} />;
}

export function CodeBlockHeader({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="code-block-header" className={cn("cn-code-block-header flex min-w-0 shrink-0 items-center *:has-[>[data-slot=code-block-title]]:min-w-0", className)} {...props} />;
}

export function CodeBlockTitle({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="code-block-title" className={cn("cn-code-block-title min-w-0 truncate [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle", className)} {...props} />;
}

export function CodeBlockActions({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="code-block-actions" className={cn("cn-code-block-actions ms-auto flex shrink-0 items-center [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 [[data-slot=code-block]>&]:pointer-coarse:opacity-100", className)} {...props} />;
}

export function CodeBlockFooter({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="code-block-footer" className={cn("cn-code-block-footer flex min-w-0 shrink-0 items-center", className)} {...props} />;
}

export type CodeBlockContentProps = ComponentProps<"pre"> & {
	code?: string;
	wrap?: boolean;
	lineNumbers?: boolean;
	startLine?: number;
};

export function CodeBlockContent({ code, wrap, lineNumbers, startLine = 1, className, style, children, ...props }: CodeBlockContentProps) {
	return (
		<pre
			tabIndex={0}
			{...props}
			data-slot="code-block-content"
			data-wrap={wrap || undefined}
			data-numbered={lineNumbers || undefined}
			dir="ltr"
			style={{ counterReset: `line ${startLine - 1}`, ...style }}
			className={cn("cn-code-block-content min-h-0 min-w-0 scroll-fade-x scrollbar-thin overflow-auto text-start font-mono outline-none data-wrap:scroll-fade-y data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap", className)}
		>
			<code data-slot="code-block-code" className="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0">
				{code !== undefined && lineNumbers
					? code.replace(/\n$/, "").split("\n").map((line, index) => <CodeBlockLine key={index} code={line} />)
					: code ?? children}
			</code>
		</pre>
	);
}

export type CodeBlockLineProps = ComponentProps<"span"> & { variant?: CodeBlockLineVariant; code?: string | readonly CodeBlockLineToken[] };

export function CodeBlockLine({ variant = "default", code, className, children, ...props }: CodeBlockLineProps) {
	return (
		<span data-slot="code-block-line" data-variant={variant} className={cn(codeBlockLineVariants({ variant }), className)} {...props}>
			<span data-slot="code-block-line-content" className="min-w-0">
				{typeof code === "string" ? code || "\n" : code ? code.length ? code.map((token, index) => <span key={index} style={token.style} className={token.className}>{token.content}</span>) : "\n" : children ?? "\n"}
			</span>
		</span>
	);
}

export type CodeBlockCopyButtonProps = Omit<Extract<ButtonProps, { href?: never }>, "href" | "asChild" | "value" | "children" | "type"> & {
	value: string;
	copyLabel?: string;
	copiedLabel?: string;
};

export function CodeBlockCopyButton({ value, copyLabel = "复制", copiedLabel = "已复制", variant = "ghost", size = "icon-xs", onClick, className, ...props }: CodeBlockCopyButtonProps) {
	const [copiedValue, setCopiedValue] = useState<string>();
	const copied = copiedValue === value;
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const attempt = useRef(0);
	useEffect(() => () => {
		attempt.current++;
	}, [value]);
	useEffect(() => () => clearTimeout(timer.current), []);
	return (
		<>
			<Button
				data-slot="code-block-copy-button"
				data-copied={copied || undefined}
				variant={variant}
				size={size}
				aria-label={copied ? copiedLabel : copyLabel}
				className={cn("cn-code-block-copy-button", className)}
				{...props}
				onClick={async (event) => {
					onClick?.(event);
					if (event.defaultPrevented || !navigator.clipboard) return;
					const current = ++attempt.current;
					try {
						await navigator.clipboard.writeText(value);
					} catch {
						return;
					}
					if (current !== attempt.current) return;
					setCopiedValue(value);
					clearTimeout(timer.current);
					timer.current = setTimeout(() => setCopiedValue(undefined), 2000);
				}}
			>
				{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
			</Button>
			<span aria-live="polite" className="sr-only">{copied ? copiedLabel : ""}</span>
		</>
	);
}

function nativeLine(line: HighlightedLine): string | CodeBlockLineToken[] {
	if (typeof line === "string") return line;
	return line.map(({ content, style, class: className }) => ({
		content,
		className,
		style: Object.fromEntries((style ?? "").split(";").filter(Boolean).map((entry) => {
			const colon = entry.indexOf(":");
			return [entry.slice(0, colon), entry.slice(colon + 1)];
		})) as CSSProperties,
	}));
}

/** Returns plain lines until the requested grammar is ready. */
export function useHighlightedCode(code: string, language: string): readonly (string | CodeBlockLineToken[])[] {
	const [loaded, setLoaded] = useState<{ language: string; stream: ReturnType<typeof createCodeStream<HighlightedLine, unknown>> }>();
	const [result, setResult] = useState<{ code: string; language: string; lines: (string | CodeBlockLineToken[])[] }>();
	useEffect(() => {
		let active = true;
		void import("#code-highlighter").then(async ({ createCodeStream, loadHighlighter }) => {
			const highlighter = await loadHighlighter(language);
			if (active && highlighter) setLoaded({ language, stream: createCodeStream(highlighter) });
		}).catch(() => {});
		return () => { active = false; };
	}, [language]);
	useEffect(() => {
		if (loaded?.language !== language) return;
		try {
			setResult({ code, language, lines: loaded.stream(code).map(nativeLine) });
		} catch {
			setResult(undefined);
		}
	}, [code, language, loaded]);
	return result?.code === code && result.language === language
		? result.lines
		: code.replace(/\n$/, "").split("\n");
}
