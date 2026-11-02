# Native Select、Input Group、Input OTP 组件页编辑器验收

日期：2026-11-02。实现与运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批 E5 为三个现有组件接入 `ComponentTuner`，不是跨框架转换，不替换原生 Select 或 Bits PinInput，不扩展旧 Studio。组件页编辑器从20增至 **23／68个**，剩余45个；用户已授权本批完成后一起提交推送，不发布包、不部署站点。最终交付状态以工作线程回执为准。

## 参数合同与组合边界

| 组件 | 参数 | 保留的差异与行为 |
| --- | --- | --- |
| Native Select | 默认／小尺寸的 Button 高度档位；共同圆角／样式自带；文字左侧内边距0–48px、步长2 | 仅调整闭合控件，保留右侧箭头留白、图标及系统选项面板；Nova小尺寸圆角与默认不同，初始显示样式自带，显式圆角覆盖小尺寸条件类 |
| Input Group | 单行 Button 高度档位；组合圆角／样式自带；行内 Addon 外侧留白、块状 Addon 横向留白0–48px；Addon 内部间距0–24px，均步长2 | 高度只作用于没有块状Addon／Textarea的单行外壳，内部Input填满内容框；顶部／底部Addon和Textarea保留自动高度。纵向留白、按钮／kbd负margin与内部控件样式不另建参数，圆角显式选择同时覆盖块状／多行条件 |
| Input OTP | 方槽尺寸使用 Button 高度档位；组间距0–24px、步长2；分组圆角／样式自带 | 槽保持正方形，显式圆角联动组与每组首尾，组内中间槽直角，单槽组同时保留两端。Sera组内gap4px和底线保留；位数、pattern和业务校验不参数化 |

三者从八套安装registry读取真实基线，用四个真实Button探针量取当前高度档位；档位写回的是当时像素值，Button之后再改需重新选择。独立 `valar.<component>-styles.v2` 存储；全局颜色、圆角基数、字号、边框和焦点token只读。每个画布／对比侧独立状态，使用唯一ID与Field标签／说明／错误关联。

### 必要的源码展开修正

`packages/parity` 旧的 `SKIP_CN_CLASSES` 为上游 `containerClassName` 保留 `cn-input-otp`，而当前Svelte组件已经通过普通 `class={cn(...)}` 传入Bits。原生成的OTP registry保留未定义的cn根类且没有CSS字段，组间距没有进入可安装源码。本批移除这一个过时skip，八套生成registry根类正常展开 `gap-2`；写回后正常展开新gap。直接修正既有源码展开源头，不添加新adapter、默认值表或探针fallback。

Input Group较重的文档页还复现了服务端入口在事件接管前可点击、第一次点击丢失的问题。共用外壳入口现等待 `onMount` 后启用，不靠E2E重复点击或固定等待规避。修复前同一新合同连续两次无法打开；修复后同一合同通过，完整39项生产E2E复核通过。

实际写回还复现了共享开发站CSS缓存未失效：Luma文件与registry写为40px，重新打开无草稿的画布仍为36px。写回期间原本抑制HMR，但结束时只失效flattened源码；本批同时失效 `src/app.css` 的模块缓存，下一次加载重新编译样式。同一脚本修复后通过（连续Native／Group写回，中间不重启服务），Luma外壳40px、输入38px且块状组合保持78px。此项是开发站写回刷新修正，不改变生产站只读边界。

### 八套基线

单位px。三个高度／槽尺寸均对应各样式Button同名档位。Native高度列按默认／小排列；Group圆角不同的布局不冒充统一档位。

| 样式 | Native高度／圆角／文字侧 | Group高度／圆角／行内外侧／块横向／gap | OTP槽／圆角／组间距 |
| --- | --- | --- | --- |
| Nova | 32／28；style；10 | 32；lg；8／10／8 | 32；lg；8 |
| Vega | 36／32；md；10 | 36；md；8／10／8 | 36；md；8 |
| Lyra | 32／28；none；10 | 32；none；8／10／8 | 32；none；8 |
| Maia | 36／32；4xl；12 | 36；style；12／12／8 | 36；4xl；8 |
| Mira | 28／24；md；8 | 28；md；8／8／4 | 28；md；8 |
| Luma | 36／32；3xl；12 | 36；style；12／12／8 | 36；3xl；8 |
| Rhea | 32／28；2xl；10 | 32；2xl；8／10／8 | 32；2xl；8 |
| Sera | 40／36；none；0 | 40；none；0／0／8 | 40；none；8 |

## 自动验证

Node24.22.2、pnpm12.14.0。

- `pnpm build:cli`、registry重建通过。
- `pnpm test`：**621通过**（CLI282、parity110、primitives148、registry addon4、docs77）。
- `pnpm check`：全仓通过；Svelte **0 errors／0 warnings**。
- 新增4个安装合同覆盖八套实际基线、非默认Button高度17／27／45／61px、两次非对称连续写回／回读、保留箭头侧和内部控件、OTP组内gap与首尾、白名单和非法参数拒绝。
- 新增3个浏览器合同：原生选择键盘与禁用选项；Addon点击聚焦／按钮不抢焦点、单行与块状高度隔离、Textarea增长；真实剪贴板粘贴／Home／End／Delete／Backspace、OTP首尾圆角。均验证对比隔离、390px最大留白／间距、保存与Esc归还焦点。
- `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`：通过。
- 完整生产 Playwright：**39通过（1.9分钟）**，包含独立tarball消费者严格check／build。使用仓库Playwright及已安装Chromium，不安装第二套浏览器。
- 本批源码格式、ESLint与 `git diff --check` 通过；写回恢复和缓存修正后重新执行621项测试、全仓check、生产构建及39项生产E2E，均通过。

## 浏览器视觉与交互证据

证据保存在工作线程的 `.amp/in/artifacts/`，非打包组件资产；在工作线程内直接查看图片／录像。

| 状态 | 截图 | 验收结果 |
| --- | --- | --- |
| 1440px浅色默认 | `input-composites-light.jpg`；三个组件各自的 `*-light.png` | 默认／小尺寸、四方向Addon、连续／分组OTP以及禁用／错误状态可辨认，无重叠裁切 |
| 局部深色 | `input-composites-dark.jpg`；`*-dark.png` | 文本、边框和错误态可辨认；保留原有禁用态低对比，不增加颜色覆盖 |
| 390px最大留白／间距 | `input-composites-narrow.jpg`；`*-narrow.png` | 页面宽390px、pane宽与scrollWidth均356px，无页面横溢；这是Chromium窄视口，不是实体手机测试 |
| 1920px并排对比 | `input-composites-compare.jpg`；`*-compare.png` | 基线与非对称草稿分别呈现，状态及几何覆盖隔离，右侧参数面板完整；完整原图及E2E计算样式核对，不依赖缩略图分辨尺寸 |

`input-composites-interaction.mp4`／`.loop.webp` 记录Input Group真实指针经过相邻输入／搜索按钮、输入 `Valar` 后点击清空、切换对比；已检查5fps联系表。1280px录像沿用共用外壳的上下堆叠对比，1920px截图展示左右并排；DOM核对草稿为空而对比侧仍为“组件”。其余Native键盘和OTP剪贴板等交互由上述已执行浏览器合同验证，不把录像未展示的行为称为录像证据。

OTP窄屏截图的36px方槽本身能放下，不能单凭该截图宣称验证了超宽方槽的局部滚动；画布保留 `overflow-x-auto`，不自动压缩或拆行验证码。

## 开发站写回与交付

三个真实POST均200；新浏览器上下文无草稿／版本覆盖，核对实际写入、生成registry与计算样式：

- Nova Native Select：默认36px／小24px、文字侧22px；箭头侧不改。
- Luma Input Group：外壳40px、内部38px、统一md圆角8px；行内外侧22px／块横向18px／Addon gap14px。块状组合写前写后均78px，没有被单行高度压缩。
- Sera Input OTP：44px方槽、Root组间距22px、原组内gap4px、xl端点14px；中间直角，移除同组其他槽的测试夹具仍验证单槽两端14px。文档站默认只引入Nova／Vega／Luma／Rhea，Sera运行时夹具使用真实上游＋刚写入的定制CSS经Tailwind编译注入，不把缺失站点样式误当成组件缺陷，也不扩大站点CSS包。

核对三份生成registry含新工具类后，脚本仅在文件仍与自己的写入一致时恢复三份精确备份，并重建registry。最终 `styles/valar/style-*.css` 无差异；仅保留必要的八套OTP根gap展开修正，不提交验收参数。

提交／推送与GitHub CI最终状态见工作线程回执。不发布包或部署站点；后续候选为Badge、基础Table，尚未开始。
