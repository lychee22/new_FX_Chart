// 移动端详情页 Tab: Details / Orders / Alerts
// 参考期望效果 685664164.png
// 2026-07-24：showOrdersAlerts 默认 false，仅渲染 Details；订单/预警后端暂未实现。

import { Tabs } from 'antd';
import type { ReactNode } from 'react';

export type MobileTabKey = 'details' | 'orders' | 'alerts';

interface MobileTabsProps {
  activeKey: MobileTabKey;
  onChange: (key: MobileTabKey) => void;
  detailsContent: ReactNode;
  ordersContent?: ReactNode;
  alertsContent?: ReactNode;
  /** 是否显示 Orders / Alerts Tab。后端未实现期间默认 false，仅渲染 Details */
  showOrdersAlerts?: boolean;
}

const LABELS: Record<MobileTabKey, string> = {
  details: 'Details',
  orders: 'Orders',
  alerts: 'Alerts',
};

/** 移动端顶部三段 Tab (居中等分) */
export function MobileTabs({
  activeKey,
  onChange,
  detailsContent,
  ordersContent,
  alertsContent,
  showOrdersAlerts = false,
}: MobileTabsProps) {
  // 关闭时仅渲染 Details 内容, 不挂载 antd Tabs (DOM / CSS / bundle 影响 = 0)
  if (!showOrdersAlerts) {
    return <>{detailsContent}</>;
  }

  const items = [
    { key: 'details', label: LABELS.details, children: detailsContent },
    {
      key: 'orders',
      label: LABELS.orders,
      children: ordersContent ?? <EmptyTab label="Orders" />,
    },
    {
      key: 'alerts',
      label: LABELS.alerts,
      children: alertsContent ?? <EmptyTab label="Alerts" />,
    },
  ];

  return (
    <Tabs
      className="mobile-tabs"
      activeKey={activeKey}
      onChange={(k) => onChange(k as MobileTabKey)}
      items={items}
      centered
      destroyOnHidden={false}
    />
  );
}

function EmptyTab({ label }: { label: string }) {
  return <div className="mobile-tab-empty">{label}（待实现）</div>;
}