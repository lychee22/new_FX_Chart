// 移动端底部固定交易按钮条: 红賣出 + 綠買入, 参考期望效果 -709069893.png
// 接入买卖 Bid/Ask 价格, 按钮可点击回调

import { useI18n } from '../i18n';
import type { Instrument } from '../types';

interface MobileTradeBarProps {
  instrument?: Instrument;
  /** 当前中间价 (可由 latestBar.close 派生, 此处由父组件传入以保持解耦) */
  midPrice?: number;
  /** Bid/Ask 价差百分比 (默认 ±0.05%) */
  spreadPct?: number;
  onSell?: () => void;
  onBuy?: () => void;
}

export function MobileTradeBar({
  instrument,
  midPrice,
  spreadPct = 0.0005,
  onSell,
  onBuy,
}: MobileTradeBarProps) {
  const { t } = useI18n();
  const code = instrument?.code ?? 'USD';
  const decimals = instrument?.decimals ?? 2;
  const sellPrice = midPrice != null ? midPrice * (1 - spreadPct) : null;
  const buyPrice = midPrice != null ? midPrice * (1 + spreadPct) : null;

  return (
    <div className="mobile-trade-bar">
      <button
        type="button"
        className="mobile-trade-btn mobile-trade-sell"
        onClick={onSell}
        disabled={sellPrice == null}
      >
        <span className="mobile-trade-label">{t('sell')}</span>
        <span className="mobile-trade-code">{code}</span>
        {sellPrice != null && (
          <span className="mobile-trade-price">{sellPrice.toFixed(decimals)}</span>
        )}
      </button>
      <button
        type="button"
        className="mobile-trade-btn mobile-trade-buy"
        onClick={onBuy}
        disabled={buyPrice == null}
      >
        <span className="mobile-trade-label">{t('buy')}</span>
        <span className="mobile-trade-code">{code}</span>
        {buyPrice != null && (
          <span className="mobile-trade-price">{buyPrice.toFixed(decimals)}</span>
        )}
      </button>
    </div>
  );
}