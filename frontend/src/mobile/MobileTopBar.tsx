// 移动端顶部导航: < 返回 + 品种名(主+副) + 全屏图标 + 搜索图标
// 参考期望效果 -709069893.png / 685664164.png

import { ArrowLeftOutlined, FullscreenOutlined, SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useI18n } from '../i18n';
import type { Instrument } from '../types';

interface MobileTopBarProps {
  instrument?: Instrument;
  onBack?: () => void;
  onFullscreen?: () => void;
  onSearch?: () => void;
}

/** 移动端顶部导航 (44px 高, 含安全区适配) */
export function MobileTopBar({ instrument, onBack, onFullscreen, onSearch }: MobileTopBarProps) {
  const { lang } = useI18n();
  const main = instrument?.name ?? '—';
  const sub = instrument ? (lang === 'en' ? instrument.code : secondaryName(instrument.code, lang)) : '';

  return (
    <header className="mobile-topbar">
      <Button
        type="text"
        shape="circle"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        aria-label="Back"
      />
      <div className="mobile-topbar-title">
        <div className="mobile-topbar-main">{main}</div>
        {sub && <div className="mobile-topbar-sub">{sub}</div>}
      </div>
      <div className="mobile-topbar-actions">
        <Button
          type="text"
          shape="circle"
          icon={<FullscreenOutlined />}
          onClick={onFullscreen}
          aria-label="Fullscreen"
        />
        <Button
          type="text"
          shape="circle"
          icon={<SearchOutlined />}
          onClick={onSearch}
          aria-label="Search"
        />
      </div>
    </header>
  );
}

/** 副名映射 (繁/简): 从品种 code 派生常见币种对子名 */
function secondaryName(code: string, lang: 'tc' | 'sc'): string {
  const map: Record<string, { tc: string; sc: string }> = {
    JPY: { tc: '美元/日圓', sc: '美元/日元' },
    AUD: { tc: '澳元/美元', sc: '澳元/美元' },
    EUR: { tc: '歐元/美元', sc: '欧元/美元' },
    GBP: { tc: '英鎊/美元', sc: '英镑/美元' },
    CAD: { tc: '美元/加元', sc: '美元/加元' },
    CHF: { tc: '美元/瑞郎', sc: '美元/瑞郎' },
    NZD: { tc: '紐元/美元', sc: '纽元/美元' },
    XAU: { tc: '黃金', sc: '黄金' },
    XAG: { tc: '白銀', sc: '白银' },
    HKD: { tc: '美元/港幣', sc: '美元/港币' },
    CNH: { tc: '美元/離岸人民幣', sc: '美元/离岸人民币' },
    CNY: { tc: '美元/在岸人民幣', sc: '美元/在岸人民币' },
    SGD: { tc: '美元/坡元', sc: '美元/坡元' },
  };
  return map[code]?.[lang] ?? code;
}