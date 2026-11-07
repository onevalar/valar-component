# Calendar 设计规范

- 值是 `@internationalized/date` 的日期对象（如 `CalendarDate`、`today(getLocalTimeZone())`），不是 JavaScript `Date`；用 `bind:value` 绑定，并设 `type="single"` 或 `type="multiple"`。
- 默认 `locale="zh-CN"`，月份和星期显示中文；其他语言的界面传对应 `locale`（如 `en-US`）；需要周一开始时设 `weekStartsOn={1}`。
- 可选范围用 `minValue`、`maxValue`，不可选的日期用 `isDateDisabled`；不要只在提交时才拒绝。
- 生日等跨度很大的日期用 `captionLayout="dropdown"` 提供年月下拉，不要让用户一个月一个月翻。
- 日期选择框（Date Picker）用 Popover + Calendar，触发按钮显示已选日期，照日期选择器文档的组合写法；选择日期区间用 Range Calendar。
- 不要用 `class` 改日期格子的尺寸和圆角，它们跟随组件样式。
- `captionLayout="dropdown"` 的月份和年份是弹出的网格（月份 3×4，年份一次 12 个、可翻页），不是浏览器自带的长列表；年份跨度很大时用 `minValue`、`maxValue` 或 `years` 限定范围（如生日设为 1920 年到今年），翻页才不会太多。
- 格子默认 36px、整体约 270px 宽，不要为了省空间缩小它；放进窄容器时用 `--cell-size` 按断点调整，而不是让日历被压扁。
- 选中日期是实心主色底、反色数字；不要给日期格子加会改文字颜色的悬停样式，否则选中后鼠标停在上面会变成一个黑块。
