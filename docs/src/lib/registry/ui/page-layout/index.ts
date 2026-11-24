import Actions from "./page-layout-actions.svelte";
import Header from "./page-layout-header.svelte";
import PropertyList from "./page-layout-property-list.svelte";
import PropertyRow from "./page-layout-property-row.svelte";
import SectionTitle from "./page-layout-section-title.svelte";
import Section from "./page-layout-section.svelte";
import Title from "./page-layout-title.svelte";
import Toolbar from "./page-layout-toolbar.svelte";
import Root from "./page-layout.svelte";

export {
	Root,
	Header,
	Title,
	Actions,
	Toolbar,
	Section,
	SectionTitle,
	PropertyList,
	PropertyRow,
	//
	Root as PageLayout,
	Header as PageLayoutHeader,
	Title as PageLayoutTitle,
	Actions as PageLayoutActions,
	Toolbar as PageLayoutToolbar,
	Section as PageLayoutSection,
	SectionTitle as PageLayoutSectionTitle,
	PropertyList as PageLayoutPropertyList,
	PropertyRow as PageLayoutPropertyRow,
};
