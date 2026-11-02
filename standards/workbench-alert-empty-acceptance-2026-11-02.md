# Alert、Empty 组件页编辑器验收

日期：2026-11-02。实现、截图和可查看的运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批E7为两个现有组件接入 `ComponentTuner`，不是跨框架转换，不修改primitive/API或默认外观，不扩展旧Studio。组件页编辑器从25增至 **27／68个**，剩余41个；P2剩17、P3十五、P4九。用户已授权验收完成后统一提交推送；最终提交和GitHub CI状态见工作线程。不发布包或部署站点，不自动启动下一批。

## 参数合同与边界

| 组件  | 参数                                                                              | 保留的差异与行为                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alert | 横向留白0–32px、纵向留白0–24px、标题说明间距0–16px，步长2；共同圆角档位／样式自带 | 只写 `gap-y-*`，保留图标条件横向间距；含Action时右侧72px预留和绝对定位不动。保留Sera侧边标记、两变体语义配色、Title／Description层次与组件默认 `role="alert"` |
| Empty | 外层留白8–64px、主区间距0–32px，步长2；共同圆角档位／样式自带                     | 只写根元素p／gap／rounded；Header／Media／Content内部间距、最大宽度、Button与Avatar几何及字号不动                                                             |

两者从八套flattened registry动态读取真实基线，不维护样式名默认值表。独立存储键为 `valar.alert-styles.v2`／`valar.empty-styles.v2`；全局token只读。preview CSS只作用指定pane，页面版本CSS排除所有编辑器；白名单只新增 `cn-alert`／`cn-empty` 的有限几何工具类，不开放颜色、任意CSS、Action或子控件权限。

Alert画布覆盖无图标普通提示、带图标及撤销操作、多段危险提示和仅标题危险提示。静态示例显式使用有名称的region，避免调参时重复警报；不修改组件默认语义。撤销只切换本地演示文字；原生说明锚点包含实例及pane标识。Empty画布覆盖图标、无媒体、默认媒体头像三种结构；头像使用现有本地图片和Fallback，装饰性alt为空。按钮只显示本地反馈，不查询数据、创建项目或发送邀请。两侧状态独立，首个Empty示例加边框让圆角可见，不改变组件默认边框。

### 八套真实基线

单位px；“自带”表示不输出圆角覆盖。

| 样式 | Alert横向／纵向／行距／圆角 | Empty外层／gap／圆角 |
| ---- | --------------------------- | -------------------- |
| Nova | 10／8／2／lg                | 24／16／xl           |
| Vega | 16／12／2／lg               | 48／16／lg           |
| Lyra | 10／8／2／none              | 24／16／none         |
| Maia | 16／12／2／lg               | 48／16／lg           |
| Mira | 8／6／2／lg                 | 24／16／xl           |
| Luma | 16／12／2／2xl              | 48／16／2xl          |
| Rhea | 16／12／2／2xl              | 48／16／3xl          |
| Sera | 16／12／4／自带             | 48／16／自带         |

## 自动验证

使用Node24.22.2、pnpm12.14.0。

- `pnpm build:cli`、registry重建通过。
- `pnpm test`：**627通过**（CLI282、parity110、primitives148、registry addon4、docs83）。新增3个永久合同验证八套基线、非对称连续写回／安装源码回读、未调样式与语义保留、非法参数和白名单拒绝。
- `pnpm check`：全仓通过；Svelte **0 errors／0 warnings**。
- `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`：通过。
- 完整生产Playwright：**43通过（2.1分钟）**，包括独立tarball消费者严格check／build。新增2个合同覆盖实时调参、对比侧基线、键盘Enter／Space演示反馈、保存版本、Esc归还焦点及关闭后的页面版本CSS。390px最大参数检查画布无横向溢出、Alert操作按钮与标题不重叠；Empty子按钮仍32px，Avatar仍32px，内部gap保持8／10px。
- 两项新增合同在开发站也通过（14.8秒）。初次开发站测试遇Vite冷依赖优化重载，画布消失；日志确认后预热再执行通过，不改产品代码绕过。生产全量回归首次完整运行通过。
- 本批源码局部Oxfmt、ESLint及 `git diff --check` 通过。

限定Empty子任务负责两个编辑器文件，主线程负责入口、白名单、永久合同、浏览器、写回与全仓回归。子任务静态检查不替代以上运行验收；临时写回测试已删除，不增加长期测试负担。

## 开发站真实写回与恢复

两个编辑器分别通过“写回组件库…”确认框执行；POST均200，中途不重启开发站：

- Nova Alert：横向22px、纵向10px、行距6px、xl；生成registry含 `gap-y-1.5`，刷新后无草稿页面padding-left22px、row-gap6px，含Action提示仍padding-right72px；重新打开编辑器基线22。
- Nova Empty：外层54px、gap22px、none；生成registry含 `p-13.5`，刷新后无草稿页面padding54px、gap22px；重新打开编辑器基线54。

写回前保存精确CSS备份，仅在文件等于原文或本脚本预计写入时恢复，避免覆盖其他写入者。结束后精确恢复CSS并重建registry；Valar样式和生成registry均无Git差异。验收参数没有设为新默认值。临时验证结果为1项通过（56.6秒）；首次脚本误按registry第一项读取组件，而第一项实际为RULES，按target查找后通过，属于检查脚本修正。

## 视觉与交互证据

下列文件保存于工作线程 `.amp/in/artifacts/` 并已逐张检查：1440px浅色默认、局部深色、1920px并排对比、390px最大参数，均DPR2。窄屏是Chromium视口模拟，不是实体手机或Safari验收。

| 状态          | Alert                  | Empty                  |
| ------------- | ---------------------- | ---------------------- |
| 浅色默认      | `e7-alert-light.png`   | `e7-empty-light.png`   |
| 局部深色      | `e7-alert-dark.png`    | `e7-empty-dark.png`    |
| 并排对比      | `e7-alert-compare.png` | `e7-empty-compare.png` |
| 390px最大参数 | `e7-alert-narrow.png`  | `e7-empty-narrow.png`  |

Alert窄屏保留独立操作列且中文自然换行；Empty说明和按钮完整显示，DOM检查页面版本64px外层留白下sample和Root也无横向溢出。顶部按钮“写回组件库…”的省略号是原有文案，不是裁切。

`e7-alert-interaction.mp4`／`.loop.webp`（11.6秒）和 `e7-empty-interaction.mp4`／`.loop.webp`（8.9秒）展示真实指针经过相邻按钮／参数和本地演示操作、参数变化；已检查5fps联系表。联系表中的反馈文字较小，不把它作为精确文字证明；反馈内容及两侧隔离由已执行的DOM检查和生产E2E验证。

## 后续

下一候选为Accordion、Alert Dialog，仍须用户确认后再开始。其余优先级已同步到[工作台路线图](WORKBENCH.md)；不为覆盖率制造无必要的旋钮，不修改用户自写的 `skills/valar-svelte/guides/`。
