# Command 设计规范

- 用于可搜索的命令或选项列表：命令面板用 `Command.Dialog`，可搜索的下拉选择（Combobox）用 Popover + `Command.Root`。选项少、不需要搜索时用 Select。
- 列表必须有 `Command.Empty`，写明没有结果时该怎么做（如“没有匹配的项目，换个关键词试试”）。
- `Command.Input` 的 `placeholder` 说明能搜什么；它不是标签，需要时用 `aria-label` 命名。
- 每个 `Command.Item` 设稳定的 `value`，搜索不到的同义词放在 `keywords`；选中后的动作写在 `onSelect`。跳转页面用 `Command.LinkItem`。
- `Command.Dialog` 的 `title`、`description` 只给读屏器读，默认是“命令面板”“搜索要执行的命令”；能更具体时传自己的值。可用 `trigger` 片段提供触发按钮，转发片段的 `props` 以保留焦点恢复。打开面板的快捷键由宿主绑定，`Command.Shortcut` 只显示文字。
- 用分组 `Command.Group`（设 `heading`）和 `Command.Separator` 组织长列表；异步加载时用 `Command.Loading`。
- 全局命令面板参考 Linear 的 Cmd+K，桌面宽度上限 720 px、面板高度上限 450 px，结果行最小高 46 px。焦点保留在搜索框，长结果在搜索框下方滚动。方向键移动选项高亮，Enter 执行，Escape 关闭。
- 工具栏筛选可在 Popover 内使用 `Command.Root appearance="compact"`。搜索框高 36 px，选项最小高 32 px，输入和选项均使用 13 px 文字。浮层表面由 Popover 提供。内联调用继续使用默认密度。
