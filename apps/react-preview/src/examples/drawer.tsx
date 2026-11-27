import { Button } from "@valar/react-ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@valar/react-ui/drawer";

const filters = ["Assigned to me", "In progress", "Needs review", "Unassigned"];

export default function DrawerExample() {
	return (
		<section aria-label="Drawer examples" className="flex flex-wrap gap-3 p-6 text-sm">
			<Drawer shouldScaleBackground={false}>
				<DrawerTrigger asChild>
					<Button variant="outline">Open filters</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Issue filters</DrawerTitle>
						<DrawerDescription>Choose the issue groups to show.</DrawerDescription>
					</DrawerHeader>
					<div className="grid min-h-0 gap-3 overflow-y-auto px-4 pb-4">
						{filters.map((filter) => (
							<label key={filter} className="flex items-center gap-2">
								<input type="checkbox" defaultChecked={filter === "Assigned to me"} />
								{filter}
							</label>
						))}
					</div>
					<DrawerFooter>
						<DrawerClose asChild>
							<Button>Done</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<Drawer direction="right" shouldScaleBackground={false}>
				<DrawerTrigger asChild>
					<Button variant="outline">Open activity</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Recent activity</DrawerTitle>
						<DrawerDescription>Updates to your workspace.</DrawerDescription>
					</DrawerHeader>
					<p className="px-4">Jordan published the project notes.</p>
					<DrawerFooter>
						<DrawerClose asChild>
							<Button variant="outline">Close activity</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</section>
	);
}
