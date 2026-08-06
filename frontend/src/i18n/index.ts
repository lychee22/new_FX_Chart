// 国际化: 移植自旧系统 js/lang.js 的 en/tc/sc 三语表
// 用 React Context 提供当前语言与 t() 翻译函数

import { createContext, useContext } from 'react';

export type Lang = 'en' | 'tc' | 'sc';

export const STRINGS = {
  en: {
    chart: 'Chart',
    // 周期
    Daily: 'Daily', Weekly: 'Weekly', Monthly: 'Monthly',
    Min1: '1-min', Min5: '5-min', Min10: '10-min', Min15: '15-min',
    Min30: '30-min', Hour1: '1-hour', Hour2: '2-hour', Hour4: '4-hour',
    // 图表类型
    TypeProsticks: 'Prosticks', TypeBar: 'Bar Chart', TypeBarModal: 'Bar & Modal', BasicBar: 'Basic Bar',
    TypeCandle: 'Candlesticks', TypeModalLine: 'Modal Lines', TypeLine: 'Line Chart', TypeArea: 'Area',
    // 2026-07-31：主图叠加成交量直方图
    TypeMainVolume: 'Candle + Volume',
    // 叠加指标
    Upper: 'Upper', SMA: 'SMA', Boll: 'Bollinger Bands', EMA: 'EMA', SAR: 'SAR',
    Ichimoku: 'Ichimoku', WMA: 'WMA', MAE: 'MAE', KC: 'KC',
    // 副图指标
    Lower: 'Lower', VOLUME: 'Volume', RSI: 'RSI', MACD: 'MACD', STC: 'Stochastic',
    MOM: 'Momentum', PCTR: 'PercentageR', OBV: 'OBV', MC: 'Modal Count', ROC: 'ROC',
    ADX: 'ADX', MFI: 'MFI', VOLA: 'Volatility', VOLP: 'Volume+', VAO: 'VAO',
    CCI: 'CCI', ATR: 'ATR',
    // 副图操作按钮 (2026-07-29)
    MoveUp: 'Move Up', Delete: 'Delete', Close: 'Close', Reset: 'Reset',
    // 工具
    Tools: 'Tools', DrawLine: 'Draw Line', ParallelLines: 'Parallel Lines',
    ParallelChannel: 'Parallel Channel',
    ClearLastLine: 'Clear Last Line', ClearAllLines: 'Clear All Lines',
    FibRetracement: 'Fibonacci Retracement', FibProjection: 'Fibonacci Projection',
    ClearFibonacci: 'Clear Fibonacci', TextBox: 'Text Box',
    ClearLastText: 'Clear Last Text', ClearAllText: 'Clear All Text',
    TextBoxPlaceholder: 'Please enter text',
    ClearAll: 'Clear All',
    Undo: 'Undo',
    // 2026-08-05：手动刷新 / 数据加载失败提示
    Refresh: 'Refresh',
    LoadFailed: 'Failed to load data',
    // 2026-08-06：首屏加载中提示
    Loading: 'Loading',
    // 2026-07-31：单类工具数量上限提示（除画线外每类最多 5 个）
    LimitReached: 'Reached the limit (max 5). Please clear existing drawings first.',
    RightClickCancel: 'Right-click to cancel',
    CancelDraw: 'Cancel',
    // 字段
    o: 'O', h: 'H', l: 'L', c: 'C', v: 'V', mp: 'MP', mc: 'MC', mpc: 'MP(C)', ar: 'AR',
    modal_point: 'Modal Point', support: 'S', resistance: 'R', latest_mp: 'Latest MP',
    bull: 'Bull', bear: 'Bear',
    // 交易
    sell: 'Sell', buy: 'Buy',
    ExitFullscreen: 'Exit Fullscreen',
    // 2026-08-05：横屏全屏模式提示 (全屏时常驻显示, 提示用户当前状态 + 退出方式)
    RotateDeviceHint: 'Landscape fullscreen mode · Tap to exit',
  },
  tc: {
    chart: '圖表',
    Daily: '日圖', Weekly: '週圖', Monthly: '月圖',
    Min1: '1分鐘', Min5: '5分鐘', Min10: '10分鐘', Min15: '15分鐘',
    Min30: '30分鐘', Hour1: '1小時', Hour2: '2小時', Hour4: '4小時',
    TypeProsticks: 'Prosticks', TypeBar: '條形圖', TypeBarModal: '柱狀及聚焦點', BasicBar:"柱状图",
    TypeCandle: '蠟燭圖', TypeModalLine: '聚焦點線', TypeLine: '線圖', TypeArea: '面積圖',
    // 2026-07-31：主圖疊加成交量直方圖
    TypeMainVolume: '蠟燭圖 + 成交量',
    Upper: '主圖', SMA: 'SMA', Boll: '保力加通道', EMA: 'EMA', SAR: '拋物線',
    Ichimoku: '一目均衡圖', WMA: 'WMA', MAE: 'MAE', KC: 'KC',
    Lower: '副圖', VOLUME: '成交量', RSI: '相對強弱指數(RSI)', MACD: '移動平均匯聚背馳指標(MACD)',
    STC: '隨機指數(STC)', MOM: '動力指標(MOM)', PCTR: '威廉指標R', OBV: '成交量平衡指數(OBV)',
    MC: '聚焦量', ROC: '變動速度指標(ROC)', ADX: '動向指數(ADX)', MFI: '資金流向指數(MFI)',
    VOLA: '波動率', VOLP: '成交量+(VOLP)', VAO: '成交量累積指標(VAO)', CCI: '順勢指標(CCI)', ATR: '平均真正波幅(ATR)',
    // 副圖操作按鈕 (2026-07-29)
    MoveUp: '上移', Delete: '刪除', Close: '關閉', Reset: '重設',
    Tools: '工具', DrawLine: '畫線', ParallelLines: '平行線',
    ParallelChannel: '平行通道',
    ClearLastLine: '清除最後一線', ClearAllLines: '清除全部線',
    FibRetracement: '黃金比例回調', FibProjection: '黃金比例投射',
    ClearFibonacci: '清除黃金比例', TextBox: '文字框', ClearLastText: '清除最後文字', ClearAllText: '清除全部文字',
    TextBoxPlaceholder: '請輸入文字',
    ClearAll: '清除全部',
    Undo: '回滾',
    // 2026-08-05：手動刷新 / 數據加載失敗提示
    Refresh: '重新整理',
    LoadFailed: '數據加載失敗',
    // 2026-08-06：首屏加載中提示
    Loading: '載入中',
    // 2026-07-31：單類工具數量上限提示 (除畫線外每類最多 5 個)
    LimitReached: '已達上限 (最多 5 個),請先清除已繪內容。',
    RightClickCancel: '按右鍵取消',
    CancelDraw: '取消',
    o: '開', h: '高', l: '低', c: '收', v: '成', mp: '聚焦點', mc: '聚焦量', mpc: '聚焦點(量)', ar: '活躍區',
    modal_point: '聚焦點', support: '支持', resistance: '阻力', latest_mp: '最新聚焦點', bull: '牛證', bear: '熊證',
    // 交易
    sell: '賣出', buy: '買入',
    ExitFullscreen: '退出全屏',
    // 2026-08-05：橫屏全屏模式提示 (全屏時常駐顯示, 提示用戶當前狀態 + 退出方式)
    RotateDeviceHint: '橫屏全屏模式 · 點擊退出',
  },
  sc: {
    chart: '图表',
    Daily: '日图', Weekly: '周图', Monthly: '月图',
    Min1: '1分钟', Min5: '5分钟', Min10: '10分钟', Min15: '15分钟',
    Min30: '30分钟', Hour1: '1小时', Hour2: '2小时', Hour4: '4小时',
    TypeProsticks: 'Prosticks', TypeBar: '条形图', TypeBarModal: '柱状及聚焦点', BasicBar:"柱状图",
    TypeCandle: '蜡烛图', TypeModalLine: '聚焦点线', TypeLine: '线图', TypeArea: '面积图',
    // 2026-07-31：主图叠加成交量直方图
    TypeMainVolume: '蜡烛图 + 成交量',
    Upper: '主图', SMA: 'SMA', Boll: '保力加通道', EMA: 'EMA', SAR: '抛物线',
    Ichimoku: '一目均衡图', WMA: 'WMA', MAE: 'MAE', KC: 'KC',
    Lower: '副图', VOLUME: '成交量', RSI: '相对强弱指数(RSI)', MACD: '移动平均汇聚背驰指标(MACD)',
    STC: '随机指数(STC)', MOM: '动力指标(MOM)', PCTR: '威廉指标R', OBV: '成交量平衡指数(OBV)',
    MC: '聚焦量', ROC: '变动速度指标(ROC)', ADX: '动向指数(ADX)', MFI: '资金流向指数(MFI)',
    VOLA: '波动率', VOLP: '成交量+(VOLP)', VAO: '成交量累积指标(VAO)', CCI: '顺势指标(CCI)', ATR: '平均真正波幅(ATR)',
    // 副图操作按钮 (2026-07-29)
    MoveUp: '上移', Delete: '删除', Close: '关闭', Reset: '重置',
    Tools: '工具', DrawLine: '画线', ParallelLines: '平行线',
    ParallelChannel: '平行通道',
    ClearLastLine: '清除最后一线', ClearAllLines: '清除全部线',
    FibRetracement: '黄金比例回调', FibProjection: '黄金比例投射',
    ClearFibonacci: '清除黄金比例', TextBox: '文字框', ClearLastText: '清除最后文字', ClearAllText: '清除全部文字',
    TextBoxPlaceholder: '请输入文字',
    ClearAll: '清除全部',
    Undo: '回滚',
    // 2026-08-05：手动刷新 / 数据加载失败提示
    Refresh: '刷新',
    LoadFailed: '数据加载失败',
    // 2026-08-06：首屏加载中提示
    Loading: '加载中',
    // 2026-07-31：单类工具数量上限提示（除画线外每类最多 5 个）
    LimitReached: '已达上限 (最多 5 个),请先清除已绘内容。',
    RightClickCancel: '右键取消',
    CancelDraw: '取消',
    o: '开', h: '高', l: '低', c: '收', v: '成', mp: '聚集点', mc: '聚焦量', mpc: '聚集点(量)', ar: '活跃区',
    modal_point: '聚焦点', support: '支持', resistance: '阻力', latest_mp: '最新聚焦点', bull: '牛证', bear: '熊证',
    // 交易
    sell: '卖出', buy: '买入',
    ExitFullscreen: '退出全屏',
    // 2026-08-05：横屏全屏模式提示 (全屏时常驻显示, 提示用户当前状态 + 退出方式)
    RotateDeviceHint: '横屏全屏模式 · 点击退出',
  },
} as const;

export type StringKey = keyof typeof STRINGS['en'];

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => STRINGS.en[key] ?? key,
});

export const useI18n = () => useContext(I18nContext);
