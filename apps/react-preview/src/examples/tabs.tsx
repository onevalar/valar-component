import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/react-ui/tabs";

export default function TabsExample() {
	return (
		<section aria-label="Tabs examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<Tabs defaultValue="overview" activationMode="manual">
				<TabsList aria-label="Project views" variant="capsule">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
					<TabsTrigger value="locked" disabled>
						Locked
					</TabsTrigger>
				</TabsList>
				<TabsContent value="overview">Project milestones and open issues.</TabsContent>
				<TabsContent value="activity">Recent project updates and comments.</TabsContent>
				<TabsContent value="locked">This view is unavailable.</TabsContent>
			</Tabs>
		</section>
	);
}
