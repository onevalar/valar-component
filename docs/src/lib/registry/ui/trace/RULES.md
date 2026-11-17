# Trace 设计规范

- 用于展示代理执行的步骤（调用工具、运行命令、编辑文件）；代理的回复用 Message，轮次之间的提示和分隔用 Marker。
- `Trace.Title` 是这一步的名称，写成说明发生了什么的完整短句（“已编辑 trace.svelte”），不要只写文件名；`Trace.Icon` 对读屏器隐藏。
- 状态用 `Trace.Line` 的 `status`（`running`、`error`、`pending`，完成的步骤不设），并同时写进标题：进行中用“正在运行 pnpm build”，失败用“运行 pnpm build 失败”。
- Agent 正在执行的步骤直接显示在 `Trace.Root` 下，标题旁可放查询词。完成后收进可展开摘要。减少动态效果时保留状态文字并停用闪动。
- 有细节时用 `Trace.Collapsible` + `Trace.CollapsibleTrigger` + `Trace.CollapsibleContent`；也可以把 Line 包在链接或 Dialog、Sheet 的触发按钮中，它会获得对应的键盘行为。
- 可重试的工具步骤在展开详情中放 `Trace.Retry`，由宿主执行真正的请求。处理中忽略重复激活，失败后可重试，结果用单一状态区域播报。重试完成后保留当前焦点，新的工具步骤可渲染独立的重试动作。
- 详情中的独立链接用带 `href` 的 `Trace.Action`，使链接和重试各自在 Tab 顺序中。
- 链接在新标签页打开时，在标题后加 `sr-only` 的“（在新标签页打开）”；CollapsibleContent 中带背景色的块要设 `text-foreground` 保持对比度。
