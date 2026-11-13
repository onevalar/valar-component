# Resizable 设计规范

- 结构为 `Resizable.PaneGroup`（`direction` 设 `horizontal` 或 `vertical`）> `Resizable.Pane` 和 `Resizable.Handle`；不要自己写拖拽调整宽度。
- 每个 Pane 设 `defaultSize`，并用 `minSize` 保证内容不会被拖到不可用；可以收起的面板设 `collapsible`。
- 需要让拖动结果在刷新后保留时，给 PaneGroup 设唯一的 `autoSaveId`。
- 分隔条可以用键盘方向键调整，需要明显的拖拽提示时设 `withHandle`；窄屏下考虑改为上下堆叠或用 Tabs 切换。
- 工作区的列表与详情使用 `Resizable.Handle appearance="workspace"`，两侧 Pane 保留自身的布局边界。悬停和拖动显示 0.5 px 线，键盘聚焦显示 1 px 强调线。给分隔线添加说明其调整对象的 `aria-label`，左右分栏的分隔线设置 `aria-orientation="vertical"`。
