import { error } from "@sveltejs/kit";
import { blockTemplate } from "../../../../../../../../apps/block-template.js";
import { blocks } from "../../../../../../__registry__/blocks.js";
import type { EntryGenerator, PageLoad } from "./$types.js";

export const prerender = true;

const templates = blocks.filter(blockTemplate);

export const entries: EntryGenerator = () =>
	templates.flatMap((block) => [{ block }, { lang: "zh", block }]);

export const load: PageLoad = ({ params }) => {
	const template = blockTemplate(params.block);
	if (!template || !templates.some((block) => block === params.block))
		error(404, "Block not found");
	return { block: params.block, template };
};
