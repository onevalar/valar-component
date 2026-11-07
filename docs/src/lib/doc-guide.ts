export type GuideSection = { title: string; body: string };

const SKIPPED_TITLES = /^(安装|installation|install|目录|contents|table of contents)$/i;

/**
 * The reading part of a component's documentation page: what it is for and how it behaves,
 * without live previews, install steps, code blocks or page scaffolding. Code stays available
 * in the source viewer and to the assistant; people reading this page mostly want the guidance.
 */
export function guideSections(raw: string): GuideSection[] {
	const text = raw
		.replace(/^---[\s\S]*?\n---\n/, "")
		.replace(/<script[\s\S]*?<\/script>/g, "")
		.replace(/<InstallTabs>[\s\S]*?<\/InstallTabs>/g, "")
		.replace(/<ComponentPreview[\s\S]*?<\/ComponentPreview>/g, "")
		.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, "")
		.split("\n")
		.filter((line) => !/^\s*[<{]/.test(line))
		.join("\n");

	const parts = text.split(/^##\s+(.+)$/m);
	const sections: GuideSection[] = [{ title: "", body: parts[0] }];
	for (let i = 1; i < parts.length; i += 2)
		sections.push({ title: parts[i].trim(), body: parts[i + 1] ?? "" });

	return sections
		.map((section) => ({ ...section, body: section.body.replace(/\n{3,}/g, "\n\n").trim() }))
		.filter(
			(section) =>
				!SKIPPED_TITLES.test(section.title) && section.body.replace(/^#{3,}\s.*$/gm, "").trim()
		);
}
