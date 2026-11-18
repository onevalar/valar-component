import { error } from "@sveltejs/kit";
import { ADVANCED_SCENES, findAdvancedScene } from "$lib/advanced-catalog.js";
import type { EntryGenerator, PageLoad } from "./$types.js";

export const prerender = true;

export const entries: EntryGenerator = () =>
	ADVANCED_SCENES.flatMap((scene) => [{ scene: scene.slug }, { lang: "zh", scene: scene.slug }]);

export const load: PageLoad = ({ params }) => {
	const scene = findAdvancedScene(params.scene);
	if (!scene) error(404, "Scene not found");
	return { scene };
};
