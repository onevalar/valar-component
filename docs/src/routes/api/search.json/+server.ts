import { isUnpublishedBasicComponentHref } from "$lib/basic-component-visibility.js";
import type { RequestHandler } from "@sveltejs/kit";

export const prerender = true;

const searchDataModules = import.meta.glob<{ href: string }[]>("./search.json", {
	eager: true,
	import: "default",
});
const searchData = (searchDataModules["./search.json"] ?? []).filter(
	(entry) => !isUnpublishedBasicComponentHref(entry.href)
);

export const GET: RequestHandler = async () => {
	return Response.json(searchData);
};
