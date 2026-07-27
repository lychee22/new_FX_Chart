// antd v5 主题: 绑定现有 main.css 的 CSS 变量主色, 保持与 PC 端蓝灰风格一致
// 仅在移动端容器内挂载, PC 端不消耗 antd 样式

import { theme, type ThemeConfig } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import enUS from 'antd/locale/en_US';
import type { Lang } from '../i18n';

export type AntdLocale = typeof zhCN;

/** 根据项目语言获取 antd locale (en/tc/sc → enUS/zhTW/zhCN) */
export function getAntdLocale(lang: Lang): AntdLocale {
  switch (lang) {
    case 'tc':
      return zhTW;
    case 'sc':
      return zhCN;
    case 'en':
    default:
      return enUS;
  }
}

/**
 * 移动端 antd 主题:
 * - 双向绑定 main.css 的 CSS 变量
 * - cssVar: true 模式, antd 内部所有 token 以 CSS 变量落地
 * - 主色 #2c5282 / 悬停 #4a90d9 与 PC 端保持视觉一致
 */
export const mobileAntdTheme: ThemeConfig = {
  cssVar: true,
  hashed: false,
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#2c5282',
    colorPrimaryHover: '#4a90d9',
    colorPrimaryActive: '#1e3a5f',
    colorSuccess: '#16a34a',
    colorError: '#dc2626',
    colorWarning: '#f59e0b',
    colorInfo: '#2c5282',
    colorLink: '#4a90d9',
    borderRadius: 4,
    borderRadiusLG: 6,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    controlHeight: 36,
    controlHeightSM: 28,
    controlHeightLG: 44,
    fontFamily:
      "'Segoe UI', 'Microsoft YaHei', 'PingFang TC', 'PingFang SC', Arial, sans-serif",
    // 移动端 z-index 需高于现有 .ms-menu (z-index: 90)
    zIndexPopupBase: 1100,
  },
  components: {
    Button: {
      controlHeight: 36,
      fontWeight: 500,
    },
    Tabs: {
      titleFontSize: 14,
      horizontalItemPadding: '8px 0',
      horizontalItemGutter: 24,
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Drawer: {
      paddingLG: 16,
    },
    Select: {
      controlHeight: 36,
    },
    InputNumber: {
      controlHeight: 36,
    },
  },
};