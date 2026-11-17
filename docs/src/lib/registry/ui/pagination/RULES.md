# Pagination 设计规范

- 用 `Pagination.Root` 的 `count`（总条数）、`perPage` 和 `bind:page` 驱动页码，`siblingCount` 控制当前页两侧显示几页；不要自己计算页码列表。
- 页码用 `Pagination.Link`（当前页设 `isActive`，带 `aria-current="page"`），前后翻页用 `Pagination.Previous`、`Pagination.Next`，省略用 `Pagination.Ellipsis`。
- 默认文案是中文（导航名称“分页”，按钮“上一页”／“下一页”，省略号“更多页”）：其他语言给 Root 传 `aria-label`，给前后按钮传 `label` 和 `aria-label`，给省略号传 `label`。
- 用量或表格结果只需前后浏览时，使用 `Pagination.Results`。箭头各为 24 px，间隔 2 px，结果文字距离按钮组 8 px。结果区旁可放 28 px 的导出按钮，窄屏允许换行。
- 通过 `formatResults` 本地化范围文字，通过 `previousLabel` 和 `nextLabel` 本地化图标按钮。零结果和单页禁用两端按钮；筛选或更换每页条数后重置页码。
- 连续浏览时让焦点留在翻页按钮。到达边界时，`Pagination.Results` 将焦点交给仍可用的方向键；两端都不可用时回到具名的分页区域。页码需要出现在网址中时同步到查询参数，刷新后保持当前页。
- 只用页码的分页在条目很少时可以隐藏；结果栏可以保留禁用的浏览键和计数，让零结果、单页及多页的结构一致。使用“加载更多”的无限列表采用其对应控件。
