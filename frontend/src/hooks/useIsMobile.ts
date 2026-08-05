// 移动端判定 hook: 按设备类型判断 (指针设备 coarse = 触摸屏手机/平板),
// 与 main.css 的 @media (pointer: coarse) 保持一致; 与 iframe 宽度无关。
// 2026-08-04：原 max-width: 768px 宽度判断改为设备类型判断 (需求5)。

import { useEffect, useState } from 'react';

// 移动端判定: 按设备类型判断 (指针设备 coarse = 触摸屏手机/平板)
const MOBILE_QUERY = '(pointer: coarse)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // Safari < 14 兼容
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  return isMobile;
}