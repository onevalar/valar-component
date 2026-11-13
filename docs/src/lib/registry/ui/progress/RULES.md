# Progress 设计规范

- 用于上传、导入等异步任务。已知范围时用 `value`、`min` 和 `max` 表达进度。任务已经开始且总量仍未知时传 `value={null}`。
- 通过 `aria-label` 提供名称，或用 `aria-labelledby` 指向旁边的说明文字。
- 旁边用文字显示百分比或“3／10”等具体进度，不要只靠条的长度。
- 高度和圆角跟随组件样式，不要用 `class` 改。
- Projects 列表的只读百分比使用 `appearance="project"`。
