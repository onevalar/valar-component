export const examples = [
	{
		id: "project",
		title: ["创建新项目", "Create a new project"],
		description: ["把一个想法整理成范围明确的项目", "Turn an idea into a well-scoped project"],
		reply: [
			"先从预期结果开始。这个项目想解决什么问题，谁会使用它？",
			"Let's start with the outcome. What problem should this project solve, and who will use it?",
		],
		followUp: [
			"给我一个目标和大致时间，我可以把它整理成范围、里程碑和验收标准。",
			"Share a goal and rough timeline, and I can lay out scope, milestones, and acceptance criteria.",
		],
	},
	{
		id: "research",
		title: ["研究一个主题", "Research a topic"],
		description: ["在待办问题中查找相关信息", "Research a topic across the issue backlog"],
		reply: [
			"你想查找哪个功能、问题或关键词？可以指定一个团队，也可以查看整个工作区。",
			"What feature, problem, or keyword should I look for? You can specify a team or search across the workspace.",
		],
		followUp: [
			"我可以按主题归纳结果，并指出需要进一步验证的地方。",
			"I can group the results by theme and flag what needs further verification.",
		],
	},
	{
		id: "team",
		title: ["建立新团队", "Set up a new team"],
		description: ["创建符合协作方式的团队", "Create a team that matches how you work"],
		reply: [
			"这个团队负责什么？先定下成员、职责和工作流，再配置状态与项目。",
			"What will this team own? Start with members, responsibilities, and workflow, then set up statuses and projects.",
		],
		followUp: [
			"如果你描述目前的协作方式，我可以给出一份可讨论的团队设置草案。",
			"Describe how the team collaborates today and I can outline a proposed setup.",
		],
	},
] as const;

export type Example = (typeof examples)[number];
export type ChatFile = {
	id: number;
	file: File;
	state: "uploading" | "done" | "error";
	url?: string;
};
export type Draft = { text: string; files: ChatFile[] };
export type Turn = {
	id: string;
	prompt: string;
	example?: Example;
	files: ChatFile[];
	phase: "thinking" | "working" | "streaming" | "done" | "stopped";
	tool: "search" | "file" | null;
	toolDone: boolean;
	workedSeconds?: number;
	reply: string[];
	checklist: string[];
};
export type Chat = { id: string; title: string; turns: Turn[]; label: string; date?: string };
type Copy = (zh: string, en: string) => string;

export const newDraft = (): Draft => ({ text: "", files: [] });

export function replyFor(text: Copy, example?: Example, files: ChatFile[] = []) {
	if (example) {
		return {
			paragraphs: [
				text(example.reply[0], example.reply[1]),
				text(example.followUp[0], example.followUp[1]),
			],
			checklist: [],
		};
	}
	return {
		paragraphs: [
			files.length
				? text(
						"已收到附件。下面是一份界面评审清单，可以用来逐项检查这个场景。",
						"The attachment is ready. Here is a checklist for reviewing this interface."
					)
				: text(
						"这里有一份界面评审清单。可以从主流程开始，再检查边界状态。",
						"Here is an interface review checklist. Start with the primary flow, then check the edge states."
					),
		],
		checklist: [
			text("确认页面标题与当前场景一致。", "Confirm that the page title matches the current view."),
			text("让主操作在第一眼就容易找到。", "Make the primary action easy to find."),
			text(
				"检查普通、悬停、按下和禁用状态。",
				"Check default, hover, pressed, and disabled states."
			),
			text("用键盘完成一次完整流程。", "Complete the flow using only a keyboard."),
			text("确认切换视图后焦点有明确去向。", "Verify where focus goes after changing views."),
			text("检查长标题和文件名的截断方式。", "Check how long titles and filenames truncate."),
			text("验证空状态能引导下一步操作。", "Verify that the empty state offers a next step."),
			text("确保加载中的状态可辨认。", "Make loading states easy to recognize."),
			text("检查失败后能否继续编辑或重试。", "Check that users can edit or retry after an error."),
			text("对照浅色和深色下的文字对比度。", "Compare text contrast in both color schemes."),
			text("在窄屏上检查换行和按钮触达。", "Check wrapping and control access on narrow screens."),
			text(
				"验证长列表的阅读位置和回到最新。",
				"Verify reading position and jumping to the latest item."
			),
			text("确认减少动态效果时控件仍易于理解。", "Verify controls with reduced motion enabled."),
			text("检查图标按钮都有清晰的可访问名称。", "Check accessible names for icon-only buttons."),
			text(
				"核对状态更新能否被辅助技术感知。",
				"Check that assistive technology receives status updates."
			),
			text(
				"记录仍需复测的交互和环境。",
				"Record any interactions or environments that need another pass."
			),
		],
	};
}

export function sampleChats(text: Copy): Chat[] {
	const reply = replyFor(text);
	return [
		{
			id: "sample",
			title: text("界面评审清单", "Interface review checklist"),
			label: text("示例", "Sample"),
			turns: [
				{
					id: "sample-turn",
					prompt: text("给我一份界面评审清单。", "Give me an interface review checklist."),
					files: [],
					phase: "done",
					tool: "search",
					toolDone: true,
					workedSeconds: 3,
					reply: reply.paragraphs,
					checklist: reply.checklist,
				},
			],
		},
	];
}
