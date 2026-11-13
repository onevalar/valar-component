# Popover 设计规范

- 用于点击后出现、可以操作的轻量面板，如小表单、筛选、选择器；纯文字提示用 Tooltip，一组操作命令用 Dropdown Menu，较长流程用 Dialog。
- 打开它的按钮通过 `Popover.Trigger` 的 `{#snippet child({ props })}` 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
- 面板有标题时用 `Popover.Header`、`Popover.Title`、`Popover.Description`，不要自己写加粗文字。
- 位置用 `side`、`align`、`sideOffset` 属性；面板会自动翻转并保持在视口内，不要用 `class` 写定位。
- 工具栏的分组设置用 `appearance="options"`，由内容组提供 8 × 16 px 内边距，32 px 行容纳紧凑选择器、复选框和简短标签。组之间用 Separator。面板按锚点和视口缩小，长内容在面板内滚动。
- 内容组件自带内边距时（如 Command、Calendar）可给默认 `Popover.Content` 加 `p-0`；需要与触发按钮同宽时用 `w-(--bits-popover-anchor-width)`，其他宽度用已有尺寸档位。
- 搜索选择（Combobox）用 Popover + Command，日期选择用 Popover + Calendar，照对应文档的组合写法，不要另做一个下拉组件。
- 面板里的操作完成后需要关闭时，用 `bind:open` 设为 `false` 或用 `Popover.Close`；关闭后焦点回到触发按钮。
- 面板默认使用 12 px 圆角、实色底和 10 px 内边距。工作区筛选、属性和对话历史可用 `appearance="surface"` 应用工作区的 Command 行密度。Command 搜索输入在打开时聚焦，关闭后回到触发器。
