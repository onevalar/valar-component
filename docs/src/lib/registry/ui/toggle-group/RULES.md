# Toggle Group 设计规范

- `ToggleGroup.Root` 必须设 `type="single"`（多选一，如对齐方式）或 `type="multiple"`（如加粗、斜体）；用 `bind:value` 绑定。
- 整组用 `aria-label` 说明用途；只有图标的 `ToggleGroup.Item` 都要有 `aria-label`。
- 默认外观的 `variant`、`size` 设在 Root 上，所有项保持一致；需要项之间留空时用 `spacing`，不要给项单独改圆角或边框。
- 切换视图或模式且各视图内容差异较大时用 Tabs。

- 富文本格式组使用 `appearance="toolbar"`。参考 Linear 选中文本后的浮动工具栏，按钮为 26 × 26 px、圆角 4 px、图标 16 px，默认间距 6 px。多个格式可同时选中，按下项用底色区分；透明度过渡为 100 ms，系统开启减少动态效果时取消过渡。键盘焦点使用内描边。
