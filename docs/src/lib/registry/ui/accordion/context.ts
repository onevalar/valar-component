import { createContext } from "svelte";

export const [getAccordionOrientation, setAccordionOrientation] =
	createContext<() => "horizontal" | "vertical">();
