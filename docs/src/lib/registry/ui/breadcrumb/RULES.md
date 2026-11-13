# Breadcrumb 设计规范

- 结构为 `Breadcrumb.Root` > `Breadcrumb.List` > `Breadcrumb.Item`，项之间放 `Breadcrumb.Separator`；不要手写斜杠或箭头。
- 当前页用 `Breadcrumb.Page`（带 `aria-current="page"`，不可点击），其余层级用带 `href` 的 `Breadcrumb.Link`。
- 默认的导航名称是“面包屑导航”，省略号 `Breadcrumb.Ellipsis` 的读屏文字是“更多”：需要时给 `Breadcrumb.Root` 传更具体的 `aria-label`（如“当前位置”），省略号用 `label` 改。
- 层级过多时中间部分折叠为 `Breadcrumb.Ellipsis`，放进 Dropdown Menu 的触发按钮中展开；窄屏下优先保留首项和最后两级。
- 问题详情的标题栏用 `appearance="workspace"`，链接高 24 px，分隔符为 `›`。长标题优先截断，键盘焦点使用 1 px 内描边。
- 工作区路径单行显示，空间不足时长链接和当前项分别截断。用可操作的菜单承载层级过多时省略的链接。
