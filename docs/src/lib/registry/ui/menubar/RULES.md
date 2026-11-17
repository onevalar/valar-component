# Menubar 设计规范

- 用于桌面应用顶部常驻的“文件／编辑／视图”等分组命令。单个按钮的操作菜单用 Dropdown Menu，直接跳转的页面链接用 Navigation Menu。
- 顶部带少量分组菜单时可用 `appearance="navigation"`。触发器高 32 px、横向留白 12 px，弹层圆角 14 px、边线 1 px。深色取样来自 Linear 公开页顶部导航，浅色及内侧焦点使用 Valar token。
- 菜单栏在窄屏下不会自动折叠；移动端改用 Dropdown Menu 或 Sheet 提供同样的操作。
- 顶部导航外观允许按行换行，弹层保留视口边距。长菜单组需要限制高度时，使用浮动 Scroll Area。
- 菜单项写法与 Dropdown Menu 相同：操作用 `onSelect`，危险项设 `variant="destructive"`，可勾选项用 `CheckboxItem`、`RadioItem`。
- `Menubar.Shortcut` 显示的快捷键必须真正实现，并与系统和浏览器的常用快捷键不冲突。
