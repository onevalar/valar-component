# Tabs 设计规范

- 用于在同一位置切换同级内容。跨页面用导航链接，有先后顺序的步骤用 Stepper，表单中的单选用 Radio Group。
- 每个 `Tabs.Trigger` 与对应的 `Tabs.Content` 用相同的 `value`；用 `bind:value` 绑定当前标签，需要时同步到网址查询参数。
- 样式只用 `Tabs.List` 的 `variant`（`default`、`line`、`capsule`），不要自己写下划线或背景。
- `capsule` 参考 Linear 项目时间线的 Health／Leads 侧栏，列表高 32 px，圆角 5 px，标签间距 2 px。触发器高 28 px，标签横向留白 12 px，字为 12 px／500。水平列表占满可用宽度，短标签均分空间。手动模式下方向键只移动焦点，由 Space 或 Enter 激活。默认、线型与胶囊的水平触发器均为 28 px 高，列表高 32 px。垂直列表按内容排列。
- 为 `Tabs.List` 设置可访问名称。水平列表宽度受父容器约束，超出时横向滚动并露出键盘焦点。Home／End 到达第一个和最后一个可用标签，禁用项跳过。垂直列表用上、下方向键。焦点轮廓向内绘制，减少动态效果时停用标签与指示线的过渡。
