## 根本原因（已通过控制台 + jsdom 诊断确认）

1. **图表全白的真正原因**：`charttest5.html` 加载了 `jquery / dateformat.js / simplechart.js`，但**漏加载了 `js/lang.js`**。而 `simplechart.js` 里有 20 处 `_lang.getStr(...)`，`Language` 构造函数和 `getStr` 内部用 `eval('en.'+str)` 回退到英文表 `en`。`en` 未定义 → `Uncaught ReferenceError: en is not defined`。这个错误在 `drawChart()` 一开始（`updateTitleBar` 里的 `_lang.getStr(...)`）就抛出，导致整张图绘制中断、canvas 全白。
   - 控制台第二行 `Unsafe attempt to load URL ... 'file:' URLs are treated as unique security origins` 只是 `file://` 协议的**安全提示**（localStorage 受限），不影响绘制，不是 bug。
   - 证据：jsdom 无头环境里补上 lang.js 后，USD/JPY 正常绘制 112 根 K 线、无报错。

2. **"数据趋于真实"**：`loadData()` 现在是一段写死的 USD/JPY JSON，**切换品种/周期根本不换数据**。需要让 Gold / EUR/USD / GBP/JPY 等各自显示符合自己价位与波动率的可信行情。

## 改动方案（两处文件）

### A. 修复白屏 —— `charttest5.html`
在第 11 行 `dateformat.js` 之后、`simplechart.js` 之前，补一行：
```html
<SCRIPT TYPE="text/javascript" src="js/lang.js"></script>
```
保持页面原有的 `<SCRIPT>` 大写、无引号风格。这是让图能画出来的关键、最小改动。

### B. 让每个品种显示自己的真实数据 —— `js/simplechart.js` 的 `loadData()`
把那段写死的单条 JSON 字符串，替换为一个**按品种生成可信 OHLC 序列**的小函数（保持项目风格：全局 `var` + `function`，无新依赖）：

- 新增 `getSampleData(code)`：内置一个 2020 年前后的参考价 / 年化波动率表（例如 `JPY:108, 8%`、`XAU:1700, 15%`、`EUR:1.08, 7%`、`GBPJPY:135, 11%`、`XAG:17, 22%` 等，覆盖 HTML 下拉里全部 34 个 code），用**确定性的种子随机**（每个 code 固定种子，所以刷新结果一致、可复现）做几何随机游走生成 ~300 根日线。
- 每根 bar 派生其余字段，保证内部一致性与 Prosticks 规则：
  - `o,h,l,c` 由随机游走 + 日内振幅生成，`l≤o,c≤h`；
  - `mp`(modal point) 取当日最常成交价区间，限制在 `[l,h]` 内；
  - `vap`≈以 `mp` 为均值的加权均价、`vam`≈成交密集点，都落在 `[l,h]`；
  - `mc`(modal count) 给 40~220 的可信整数；`ut/lt`(上/下活跃区) 取 h/l 附近或 0；`v` 给 0（与原样本一致）；
  - `dt` 从 2020-05-29 倒推的交易日序列，保持 `YYYYMMDDHHMM` 格式。
- `loadData()` 里：`var jsonString = JSON.stringify(getSampleData(code));` —— 其后原有的 `$.parseJSON`、`getLocalTime`、`mclose/pclose/popen` 计算、右侧 50 根空白扩展 bar 逻辑**全部保留不动**。

效果：切换 USD/JPY / Gold / EUR-USD 等会看到各自价位与波动率不同的曲线；切换周期则沿用同一序列重绘（与原架构一致）。仍保持纯静态、无后端、无构建步骤。

## 验证方式
- 用现有 `diag.js`（jsdom 无头）跑一次：补上 lang.js + 新生成器后，确认 `0 errors` 且仍有数百次 `fillRect`（K线）；
- 你在浏览器打开 `charttest5.html`：确认 K 线/标题/十字光标显示，切换不同品种价位明显不同。
- （注：`diag.js`、`node_modules/`、`package.json` 是我调试用的临时文件，实施时会清理掉，不进项目。）