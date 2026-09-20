// 叠加指标加载 hook
// 2026-09-08：从 ChartPanel.tsx 抽到 hooks/useOverlayIndicator.ts
//
// 封装：
//   - loadOverlayIndicator — 加载/重载叠加指标（IKH 走 primitive，其他走 LineSeries）
//   - [upper] effect — 上层指标变化时重载
//   - [chartType] effect 中的 IKH 分支（IKH 需随 chartType 重建 primitive）
//   - [upperParams] effect 由 useLowerPanes 协调触发（loadOverlayIndicator 调用）

import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';
import { message } from 'antd';
import { indicatorApi } from '../api/client';
import { formatIndicatorParams } from '../constants/indicatorParams';
import { sanitizePoints } from '../utils/formatters';
import { IchimokuPrimitive } from './primitives/IchimokuPrimitive';
import { NationPalette, UPPER_TECH } from '../types';
import { useI18n } from '../i18n';

export interface UseOverlayIndicatorDeps {
  chartRef: MutableRefObject<IChartApi | null>;
  mainSeriesRef: MutableRefObject<ISeriesApi<any> | null>;
  ichimokuPrimRef: MutableRefObject<IchimokuPrimitive | null>;
  overlaySeriesRef: MutableRefObject<ISeriesApi<any>[]>;
  barsRef: MutableRefObject<any[]>;
  fullscreenRef: MutableRefObject<boolean>;
  palette: NationPalette;
  upper: number;
  code: string;
  interval: number;
  upperParams?: number[];
  // 协作
  fitTimeScaleDefault: () => void;
}

export interface UseOverlayIndicatorApi {
  loadOverlayIndicator: (
    upper: number,
    code: string,
    interval: number,
    params?: number[],
    preserveScale?: boolean,
  ) => Promise<void>;
}

export function useOverlayIndicator(deps: UseOverlayIndicatorDeps): UseOverlayIndicatorApi {
  const {
    chartRef, mainSeriesRef, ichimokuPrimRef, overlaySeriesRef, barsRef,
    fullscreenRef, palette, upper, code, interval, upperParams, fitTimeScaleDefault,
  } = deps;

  const { t } = useI18n();
  const overlayRequestRef = useRef(0);

  // 2026-09-10：useCallback 稳定化 — 此前裸声明每次 render 新引用, 传染给
  // useLowerPanes (buildOpsDeps/params effect) 与 ChartPanel 的 loadMainData 依赖链。
  // 入参显式传 upper/code/interval/params (调用方负责给最新值), 函数体其余走 refs,
  // 依赖仅需 fitTimeScaleDefault 与 t (错误提示文案)。
  const loadOverlayIndicator = useCallback(async (
    upperParam: number,
    codeParam: string,
    intervalParam: number,
    params?: number[],
    preserveScale = false,
  ) => {
    const chart = chartRef.current;
    if (!chart || !mainSeriesRef.current) return;
    const requestId = ++overlayRequestRef.current;
    // 清除旧叠加序列
    overlaySeriesRef.current.forEach((s) => chart.removeSeries(s));
    overlaySeriesRef.current = [];
    if (ichimokuPrimRef.current) {
      mainSeriesRef.current.detachPrimitive(ichimokuPrimRef.current);
      ichimokuPrimRef.current = null;
    }
    if (upperParam === UPPER_TECH.NONE) return;

    try {
      // 2026-07-21 17:26:43：仅 Ichimoku 请求未来时间点并启用专用云层，避免影响其他叠加指标。
      // 2026-08-04：参数接入 — 按指标个数格式化后传给后端 (null 走默认)。
      const result = await indicatorApi.calculate(
        'upper', upperParam, codeParam, intervalParam,
        formatIndicatorParams('upper', upperParam, params), upperParam === UPPER_TECH.IKH,
      );
      if (requestId !== overlayRequestRef.current || chartRef.current !== chart || !mainSeriesRef.current) return;
      for (const s of result.series) {
        const series = chart.addSeries(LineSeries, {
          color: s.color,
          lineWidth: 1,
          priceScaleId: 'right',
          lastValueVisible: true,
        });
        // 2026-07-30：兜底 — sanitizePoints 丢弃 NaN/undefined/重复 time，避免 setData 抛 Assertion 导致主图加载失败
        const { points } = sanitizePoints(s.data);
        series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        overlaySeriesRef.current.push(series);
      }
      if (upperParam === UPPER_TECH.IKH && result.id === 'IKH') {
        const primitive = new IchimokuPrimitive(chart, mainSeriesRef.current);
        primitive.setData(result, barsRef.current, intervalParam <= 2);
        mainSeriesRef.current.attachPrimitive(primitive);
        ichimokuPrimRef.current = primitive;
        // 2026-08-05：刷新路径 preserveScale=true 时跳过 — 不重置时间轴缩放
        if (!preserveScale) fitTimeScaleDefault();
      }
    } catch (e) {
      console.error('加载叠加指标失败', e);
      message.error(t('LoadFailed'));
    }
    // 注：fullscreenRef 在此 hook 内未直接使用，但保留入参以备未来扩展
    void fullscreenRef;
  }, [chartRef, mainSeriesRef, ichimokuPrimRef, overlaySeriesRef, barsRef,
      fitTimeScaleDefault, t]);

  // ---- 叠加指标切换 ----
  useEffect(() => {
    void loadOverlayIndicator(upper, code, interval, upperParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upper]);

  return { loadOverlayIndicator };
}
