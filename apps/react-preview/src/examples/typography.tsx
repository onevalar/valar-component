export default function TypographyExample() {
	return (
		<article aria-label="Typography example" className="w-full max-w-xl p-6">
			<h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-balance">
				Workspace release notes
			</h1>
			<p className="mt-4 text-[15px] leading-6 text-muted-foreground">
				A quick review of what changed and what your team should do next.
			</p>
			<h2 className="mt-8 scroll-m-20 border-b-[0.5px] border-border pb-2 text-lg font-semibold tracking-tight">
				New project views
			</h2>
			<p className="mt-4 text-[13px] leading-6">
				Use <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono">saved-view</code> to
				share a filtered list with teammates.
			</p>
			<blockquote className="mt-4 border-s-2 border-border ps-4 text-[13px] leading-6 text-muted-foreground italic">
				Shared views preserve the filters, not the order of individual issues.
			</blockquote>
			<ul className="my-4 ms-5 list-disc text-[13px] leading-6 [&>li]:mt-1.5">
				<li>Name the view after the work it tracks.</li>
				<li>Check the filters before sharing the link.</li>
			</ul>
		</article>
	);
}
