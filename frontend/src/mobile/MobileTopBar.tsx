// 移动端顶部导航: < 返回 + 品种名(主+副, 可点击切换) + 全屏图标 + 搜索图标
// 参考期望效果 -709069893.png / 685664164.png
// 2026-08-04：标题区域支持点击切换品种 (需求3), 与搜索图标同一入口。

import { ArrowLeftOutlined, DownOutlined, FullscreenOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useI18n } from '../i18n';
import type { Instrument } from '../types';

interface MobileTopBarProps {
  instrument?: Instrument;
  onBack?: () => void;
  onFullscreen?: () => void;
  onSearch?: () => void;
  /** 2026-08-04：点击标题(货币名) → 打开品种切换 (需求3) */
  onTitleClick?: () => void;
  /** 2026-08-05：手动刷新 — 重拉 K 线 + 指标全量数据 (断线补数据/数据异常重试) */
  onRefresh?: () => void;
  /** 2026-08-06：刷新进行中 — 刷新图标旋转转圈 (不影响界面展示) */
  refreshing: boolean;
}

/** 移动端顶部导航 (44px 高, 含安全区适配) */
export function MobileTopBar({ instrument, onBack, onFullscreen, onSearch, onTitleClick, onRefresh, refreshing }: MobileTopBarProps) {
  const { lang, setLang } = useI18n();
  const main = instrument?.name ?? '—';
  const sub = instrument ? (lang === 'en' ? instrument.code : secondaryName(instrument.code, lang)) : '';

  return (
    <header className="mobile-topbar">
      <button type="button" className="mobile-topbar-title" onClick={onTitleClick} aria-label="Switch instrument">
        <div className="mobile-topbar-main">{main}</div>
        {sub && <div className="mobile-topbar-sub">{sub}</div>}
        <DownOutlined className="mobile-topbar-title-caret" />
      </button>
      {/* 2026-08-10: 开放语言切换 — 与 PC 工具栏 lang-group 行为一致, 紧凑三按钮放在刷新按钮左侧 */}
      <div className="mobile-topbar-lang-group" role="group" aria-label="Language">
        <button
          type="button"
          className={`mobile-lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
        >EN</button>
        <button
          type="button"
          className={`mobile-lang-btn ${lang === 'tc' ? 'active' : ''}`}
          onClick={() => setLang('tc')}
          aria-pressed={lang === 'tc'}
        >繁</button>
        <button
          type="button"
          className={`mobile-lang-btn ${lang === 'sc' ? 'active' : ''}`}
          onClick={() => setLang('sc')}
          aria-pressed={lang === 'sc'}
        >简</button>
      </div>
      {/* 2026-08-05：手动刷新按钮 — 断线补数据 / 加载失败重试 */}
      {onRefresh && (
        <div className="mobile-topbar-actions">
          <Button
            type="text"
            shape="circle"
            icon={<ReloadOutlined className={refreshing ? 'spin' : ''} />}
            onClick={onRefresh}
            aria-label="Refresh"
          />
        </div>
      )}
      {/* <div className="mobile-topbar-actions">
        <Button
          type="text"
          shape="circle"
          icon={<SearchOutlined />}
          onClick={onSearch}
          aria-label="Search"
        />
      </div> */}
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
