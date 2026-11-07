// @ts-check
import { defineCollection, defineConfig, s } from "velite";

const dateSchema = s.union([s.string(), s.date()]).transform((date) => {
	/** @param {Date} value */
	function formatDate(value) {
		const year = value.getUTCFullYear();
		const month = String(value.getUTCMonth() + 1).padStart(2, "0");
		const day = String(value.getUTCDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	if (date instanceof Date) {
		return formatDate(date);
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new Error(`Invalid date "${date}". Expected YYYY-MM-DD.`);
	}

	const parsedDate = new Date(`${date}T00:00:00Z`);
	if (Number.isNaN(parsedDate.getTime()) || formatDate(parsedDate) !== date) {
		throw new Error(`Invalid date "${date}". Expected a valid YYYY-MM-DD date.`);
	}

	return date;
});

const docSchema = s
	.object({
		title: s.string(),
		description: s.string(),
		date: dateSchema.optional(),
		path: s.path(),
		navLabel: s.string().optional(),
		links: s
			.object({
				doc: s.string().optional(),
				api: s.string().optional(),
				source: s.string().optional(),
			})
			.optional(),
		component: s.boolean().default(false),
		toc: s.toc(),
		raw: s.raw(),
	})
	.transform(({ raw, ...data }) => {
		// Chinese documents live under `content/zh` with the same relative structure as the
		// English originals, so a single collection can serve both locales.
		const isChinese = data.path === "zh" || data.path.startsWith("zh/");
		let path = isChinese ? data.path.slice(3) : data.path;
		// Velite normalizes `zh/index.md` to `zh`, so the Chinese home doc needs its path back.
		if (path === "") path = "index";

		// Live examples of the page with the heading above each, so a component page can lead with
		// its visual states and keep install and usage notes behind them.
		const previews = [];
		let heading = "";
		// Plain paragraphs under the current heading, and whether each came after the last code block.
		/** @type {{ text: string; afterCode: boolean }[]} */
		let paragraphs = [];
		/** @type {string[]} */
		let current = [];
		let fenced = false;
		let script = false;
		const flush = () => {
			if (current.length) paragraphs.push({ text: current.join(" "), afterCode: true });
			current = [];
		};
		/** The first couple of sentences, so a card explains its example without a wall of text. */
		const brief = (/** @type {string} */ text) => {
			const plain = text
				.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
				.replace(/[`*]/g, "")
				.trim();
			const sentences = plain.match(/[^。！？]+[。！？]?/g) ?? [plain];
			let out = "";
			for (const sentence of sentences) {
				if (out && (out + sentence).length > 90) break;
				out += sentence;
			}
			return out.trim();
		};
		for (const line of raw.split("\n")) {
			if (line.startsWith("```")) {
				flush();
				// Text before a code block describes the code; only what follows it explains the example.
				if (fenced) for (const p of paragraphs) p.afterCode = false;
				fenced = !fenced;
				continue;
			}
			if (fenced) continue;
			if (/^\s*<script\b/.test(line)) script = true;
			if (script) {
				if (/<\/script>/.test(line)) script = false;
				continue;
			}
			// Both `##` and `###` name an example: the nearest heading wins.
			const h = line.match(/^#{2,3}\s+(.+)$/);
			if (h) {
				flush();
				heading = h[1].trim();
				paragraphs = [];
				continue;
			}
			const p = line.match(/<ComponentPreview\b[^>]*\bname="([^"]+)"/);
			if (p) {
				flush();
				// The paragraph written right before the example says what it shows; failing that,
				// the section's opening paragraph does.
				const near = paragraphs.findLast((x) => x.afterCode);
				const text = brief((near ?? paragraphs[0])?.text ?? "");
				previews.push({ name: p[1], title: heading, text });
				paragraphs = [];
			} else if (!line.trim()) {
				flush();
			} else if (
				!/^[<{|#\t-]/.test(line.trim()) &&
				!line.startsWith("\t") &&
				!/^\d+\.\s/.test(line.trim())
			) {
				current.push(line.trim());
			}
		}

		return {
			...data,
			previews,
			/** @type {"en" | "zh"} */
			locale: isChinese ? "zh" : "en",
			path,
			slug: path.split("/").slice(1).join("/"),
			slugFull: `/${path}`,
		};
	});

/** @param {string} dir */
function patterns(dir) {
	return [`./${dir}/**/*.md`, `./zh/${dir}/**/*.md`];
}

const gettingStarted = defineCollection({
	name: "gettingStarted",
	pattern: ["./*.md", "./zh/*.md"],
	schema: docSchema,
});

const migration = defineCollection({
	name: "migration",
	pattern: patterns("migration"),
	schema: docSchema,
});

const components = defineCollection({
	name: "components",
	pattern: patterns("components"),
	schema: docSchema,
});

const installation = defineCollection({
	name: "installation",
	pattern: patterns("installation"),
	schema: docSchema,
});

const darkMode = defineCollection({
	name: "darkMode",
	pattern: patterns("dark-mode"),
	schema: docSchema,
});

const registry = defineCollection({
	name: "registry",
	pattern: patterns("registry"),
	schema: docSchema,
});

const forms = defineCollection({
	name: "forms",
	pattern: patterns("forms"),
	schema: docSchema,
});

const utils = defineCollection({
	name: "utils",
	pattern: patterns("utils"),
	schema: docSchema,
});

const aiElements = defineCollection({
	name: "aiElements",
	pattern: patterns("ai-elements"),
	schema: docSchema,
});

const changelog = defineCollection({
	name: "changelog",
	pattern: patterns("changelog"),
	schema: docSchema,
});

export default defineConfig({
	root: "./content",
	collections: {
		gettingStarted,
		migration,
		components,
		installation,
		darkMode,
		registry,
		forms,
		utils,
		aiElements,
		changelog,
	},
	// `velite --clean` removes this output.assets directory, which is the whole `static` folder.
	// Always run plain `velite` (as `pnpm build:content` does); never add `--clean` here.
	output: { assets: "static" },
});
