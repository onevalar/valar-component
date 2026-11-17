# Drawer 设计规范

- 用于移动端从屏幕边缘拉出、可拖拽关闭的面板。桌面端同样的内容通常改用 Dialog 或 Sheet。
- 工作区导航使用 `Drawer.Root direction="left"` 和 `Drawer.Content appearance="workspace"`。面板填满高度，宽度最多 330 px，窄屏至少留 24 px；开放侧圆角为 12 px，页眉水平内边距为 12 px。
- 每个 `Drawer.Content` 都要有 `Drawer.Title`，不显示时加 `class="sr-only"`（检查规则 `valar/overlay-title`）。
- 方向用 `Drawer.Root` 的 `direction` 属性；拖拽把手只在 `bottom` 方向显示，其他方向要提供 `Drawer.Close` 按钮。
- 需要停在几个固定高度时用 `snapPoints` 和 `bind:activeSnapPoint`，不要自己计算高度。
- 背景缩放（`shouldScaleBackground`，默认开启）需要应用根元素带 `data-vaul-drawer-wrapper` 属性才生效；不需要时设为 `false`。
- 长内容放在 `Drawer.Header` 与 `Drawer.Footer` 之间的悬浮 Scroll Area，给视口可读名称。给滚动区域添加 `data-vaul-no-drag`，让指针滚动与滑块拖动独立于面板拖拽。
- 打开它的按钮通过 `Drawer.Trigger` 的 `child` snippet 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
