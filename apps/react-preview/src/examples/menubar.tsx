import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@valar/react-ui/menubar";
import { useState } from "react";

export default function MenubarExample() {
	const [showOutline, setShowOutline] = useState(false);
	const [note, setNote] = useState("Launch notes");

	return (
		<section aria-label="Menubar examples" className="grid w-full max-w-sm gap-3 p-6 text-sm">
			<Menubar aria-label="Notebook menu" className="w-fit">
				<MenubarMenu value="file">
					<MenubarTrigger>File</MenubarTrigger>
					<MenubarContent>
						<MenubarItem onSelect={() => setNote("Untitled note")}>New note</MenubarItem>
						<MenubarItem onSelect={() => setNote("Launch notes")}>Open launch notes</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu value="view">
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarCheckboxItem checked={showOutline} onCheckedChange={setShowOutline}>
							Show outline
						</MenubarCheckboxItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
			<div className="grid gap-2 rounded-lg border-[0.5px] border-border bg-card p-3">
				<h2 aria-live="polite" className="font-medium">
					{note}
				</h2>
				{showOutline && (
					<p className="text-muted-foreground">
						Outline: {note === "Launch notes" ? "Checklist, owners, and dates" : "No headings yet"}
					</p>
				)}
			</div>
		</section>
	);
}
