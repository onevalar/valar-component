# Sidebar 设计规范

- 应用外层放 `Sidebar.Provider`（已包含 `Tooltip.Provider`），里面放 `Sidebar.Root` 和主内容；使用 `variant="inset"` 时主内容必须包在 `Sidebar.Inset` 中。需要读写展开状态时用 `useSidebar()`，不要自己维护。
- 折叠方式用 `collapsible`（`offcanvas`、`icon`、`none`），样式用 `variant`（`sidebar`、`floating`、`inset`），位置用 `side`；展开、收起和图标模式的宽度在 `constants.ts` 的 `SIDEBAR_WIDTH*` 中统一修改，不要在 `class` 里写宽度。
- 菜单项用 `Sidebar.MenuButton`；跳转用 `child` snippet 渲染 `<a href>`。当前页设 `isActive`，它只改变样式，链接上还要设 `aria-current="page"`。
- `collapsible="icon"` 时每个 MenuButton 都要设 `tooltipContent`，否则收起后只剩图标没有说明。
- `Sidebar.Trigger` 和 `Sidebar.Rail` 的读屏名称默认是“切换侧边栏”（Trigger 用 `label` 改，Rail 用 `aria-label` 改）；移动端抽屉的隐藏标题用 `Sidebar.Root` 的 `mobileTitle`、`mobileDescription` 改。
- `Sidebar.Provider` 的 `keyboardShortcut` 默认为 `true`，启用 ⌘B／Ctrl+B；`input`、`textarea`、可编辑的 `contenteditable` 区域及其子元素内不触发、不阻止原生快捷键。应用要保留该组合键时设 `keyboardShortcut={false}`：不调用 `preventDefault`，不改变展开状态、写 cookie 或触发展开回调/相关播报；`Sidebar.Trigger`、`Sidebar.Rail` 与 `useSidebar().toggle()` 仍可使用。不要在快捷键仍开启时把它分给其他功能。
- 展开状态会写入名为 `SIDEBAR_COOKIE_NAME` 的 cookie；需要刷新后保持时，在服务端 `load` 中读取它并传给 `Sidebar.Provider` 的 `open`，避免页面闪动。
- 工作区菜单滚动发生在 Sidebar.Content。工作区常规和小号导航行同为 28 px 高、8 px 圆角，图文间隔 6 px。行尾操作或计数占用自己的留白。移动端侧栏关闭后焦点返回打开它的 Sidebar.Trigger。使用自定义移动端关闭按钮时设置 `mobileCloseButton={false}`。
