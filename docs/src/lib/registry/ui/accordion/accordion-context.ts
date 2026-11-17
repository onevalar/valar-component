import { createContext } from "svelte";

export type AccordionAppearance = "default" | "section";

export const [getAccordionAppearance, setAccordionAppearance] =
	createContext<() => AccordionAppearance>();
