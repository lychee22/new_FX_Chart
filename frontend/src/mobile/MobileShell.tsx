// 移动端壳: 包裹 antd ConfigProvider + LocaleProvider, 提供三语切换能力
// 仅当 isMobile === true 时挂载, PC 端不消耗 antd 样式

import { ConfigProvider } from 'antd';
import { useI18n } from '../i18n';
import { mobileAntdTheme, getAntdLocale } from '../theme/antdTheme';
import type { ReactNode } from 'react';

interface MobileShellProps {
  children: ReactNode;
  className?: string;
}

/** 移动端专用 Provider 栈: antd ConfigProvider + Locale */
export function MobileShell({ children, className }: MobileShellProps) {
  const { lang } = useI18n();
  return (
    <ConfigProvider theme={mobileAntdTheme} locale={getAntdLocale(lang)}>
      <div className={`mobile-shell ${className ?? ''}`.trim()}>{children}</div>
    </ConfigProvider>
  );
}