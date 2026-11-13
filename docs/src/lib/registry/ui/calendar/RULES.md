# Calendar 设计规范

- 值是 `@internationalized/date` 的日期对象（如 `CalendarDate`、`today(getLocalTimeZone())`），不是 JavaScript `Date`；用 `bind:value` 绑定，并设 `type="single"` 或 `type="multiple"`。
- 默认 `locale="zh-CN"`，星期从周一开始。其他语言或周起始日通过 `locale` 和 `weekStartsOn` 指定。
- 可选范围用 `minValue`、`maxValue`，不可选的日期用 `isDateDisabled`；不要只在提交时才拒绝。
- 生日等跨度很大的日期用 `captionLayout="dropdown"` 提供年月下拉，不要让用户一个月一个月翻。
- 日期选择框（Date Picker）用 Popover + Calendar，触发按钮显示已选日期，照日期选择器文档的组合写法；选择日期区间用 Range Calendar。
- 不要用 `class` 改日期格子的尺寸和圆角，它们跟随组件样式。
- `captionLayout="dropdown"` 复用 Valar Select。菜单按可用空间定位，最高 240 px，选项在内部滚动。用 `minValue`、`maxValue` 或 `years` 限定范围。
- 使用样式自带的格子尺寸。需要调整时通过 `--cell-size` 显式设置。
- 日期默认使用圆形单元格。今日用中性色底和细边，选中使用强调色底和反色数字，键盘焦点画在单元格内。项目月历用 `appearance="project-date"` 获得紧凑的 26 px 日期和右侧翻月按钮。
