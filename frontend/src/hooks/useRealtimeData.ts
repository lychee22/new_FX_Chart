// 实时数据 hook
// 2026-09-08：从 ChartPanel.tsx 抽到 hooks/useRealtimeData.ts
//
// 封装：
//   - MarketSocket 单连接（创建/订阅/重订阅/重连回调）
//   - handleRealtimeBar (实时 K 线增量)
//   - applyIndicatorDelta (实时指标增量, 含 lowerResultsRef 缓存更新)
//   - handleRealtimeIndicators (含 wsIndicatorsDisabled / suppressUpper 守门)
//   - liveSelectionRef / wsIndicatorsDisabledRef / suppressUpperRef / socketRef 维护
//
// 注意：handleRealtimeBar 内部依赖 mainSeriesRef / volumeSeriesRef / prosticksPrimRef 等。
// 实时数据消费不直接依赖 props.chartType —— 通过 ref 镜像实时反映。

import { useEffect, useRef, type MutableRefObject } from 'react';
import {
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';
import { MarketSocket } from '../realtime/MarketSocket';
import type { Bar, IndicatorResult, NationPalette, RealtimeBarMessage, RealtimeIndicatorsMessage } from '../types';
import { LOWER_TECH, UPPER_TECH } from '../types';
import { sanitizePoints } from '../utils/formatters';
import { toMainSeriesPoint } from '../utils/chartTypes';

export interface UseRealtimeDataDeps {
  chartRef: MutableRefObject<IChartApi | null>;
  mainSeriesRef: MutableRefObject<ISeriesApi<any> | null>;
  volumeSeriesRef: MutableRefObject<ISeriesApi<any> | null>;
  prosticksPrimRef: MutableRefObject<any>;
  ichimokuPrimRef: MutableRefObject<any>;
  overlaySeriesRef: MutableRefObject<ISeriesApi<any>[]>;
  barsRef: MutableRefObject<Bar[]>;
  paneSeriesMapRef: MutableRefObject<Map<number, ISeriesApi<any>[]>>;
  lowerResultsRef: MutableRefObject<Map<number, IndicatorResult>>;
  fullscreenRef: MutableRefObject<boolean>;
  // 标志位 ref（与 useLowerPanes 共享）
  wsIndicatorsDisabledRef: MutableRefObject<boolean>;
  suppressUpperRef: MutableRefObject<boolean>;
  // WS 重连重拉（由 refreshAllData 通过 refreshAllRef 提供）
  refreshAllRef: MutableRefObject<(() => void) | null>;
  // 副图值刷新
  refreshLowerValues: () => void;
  palette: NationPalette;
  code: string;
  interval: number;
  upper: number;
  lower: number[];
  // 用于实时 bar 转 update 点（toMainSeriesPoint 需要 chartType）
  // 实际运行时通过 ref 镜像，初始值用 props.chartType 即可（重渲染由 useLowerPanes 等触发）
  chartType: number;
}

export interface UseRealtimeDataApi {
  /** 实时镜像当前选中 (liveSelectionRef.current) */
  setLiveSelection: (sel: { code: string; interval: number; upper: number; lower: number[]; chartType: number }) => void;
}

export function useRealtimeData(deps: UseRealtimeDataDeps): UseRealtimeDataApi {
  const {
    chartRef, mainSeriesRef, volumeSeriesRef, prosticksPrimRef, ichimokuPrimRef,
    overlaySeriesRef, barsRef, paneSeriesMapRef, lowerResultsRef, fullscreenRef,
    wsIndicatorsDisabledRef, suppressUpperRef, refreshAllRef,
    refreshLowerValues, palette, code, interval, upper, lower, chartType,
  } = deps;

  // 镜像最新 props (useRealtimeData 内部消费的 chartType/code/interval 都从此 ref 读取)
  const liveSelectionRef = useRef({
    code, interval, upper, lower, chartType,
  });
  liveSelectionRef.current = { code, interval, upper, lower, chartType };

  const socketRef = useRef<MarketSocket | null>(null);

  const handleRealtimeBar = (message: RealtimeBarMessage): void => {
    const selected = liveSelectionRef.current;
    if (message.code !== selected.code || message.interval !== selected.interval) return;
    const bars = barsRef.current;
    const last = bars[bars.length - 1];
    if (!last || message.bar.time > last.time) {
      bars.push(message.bar);
      if (bars.length > 300) bars.shift();
    } else if (message.bar.time === last.time) {
      bars[bars.length - 1] = message.bar;
    } else {
      return;
    }
    const point = toMainSeriesPoint(message.bar, selected.chartType);
    if (point && mainSeriesRef.current) mainSeriesRef.current.update(point);
    // 2026-07-31：主图叠加成交量 — 实时增量同步更新最末点高度与颜色
    if (volumeSeriesRef.current && message.bar.v > 0) {
      volumeSeriesRef.current.update({
        time: message.bar.time as Time,
        value: message.bar.v,
        color: message.bar.c >= message.bar.o
          ? palette.bar.upColor
          : palette.bar.downColor,
      });
    }
    prosticksPrimRef.current?.setData(bars);
  };

  const applyIndicatorDelta = (
    seriesList: ISeriesApi<any>[], result: IndicatorResult, indicatorType?: number, tech?: number,
  ): void => {
    result.series.forEach((item, index) => {
      const series = seriesList[index];
      if (!series || item.data.length === 0) return;
      // 2026-08-05：重订阅/重连后后端重推全量 INDICATORS — 快照就地整体替换。
      // 旧逻辑只取 data[0] 做 update, 会把指标线从历史首点"拉回起点"重绘。
      if (item.data.length > 1) {
        const { points } = sanitizePoints(item.data);
        if (indicatorType === LOWER_TECH.MACD && index === 2) {
          series.setData(
            points.map((d) => ({
              time: d.time as Time,
              value: d.value,
              color: d.value >= 0 ? palette.overlay.up : palette.overlay.down,
            })),
          );
        } else {
          series.setData(points.map((d) => ({ time: d.time as Time, value: d.value })));
        }
        return;
      }
      const point = item.data[0];
      if (!point || point.value === null) return;
      const update: any = { time: point.time as Time, value: point.value };
      if (indicatorType === LOWER_TECH.MACD && index === 2) {
        update.color = point.value >= 0 ? palette.overlay.up : palette.overlay.down;
      }
      series.update(update);
    });
    // 2026-07-29：副图增量数据时更新缓存与浮层值（key=tech）
    if (tech !== undefined) {
      lowerResultsRef.current.set(tech, result);
      refreshLowerValues();
    }
  };

  const handleRealtimeIndicators = (message: RealtimeIndicatorsMessage): void => {
    const selected = liveSelectionRef.current;
    if (message.code !== selected.code || message.interval !== selected.interval) return;
    // 2026-08-04：自定义参数时 WS 的 INDICATORS 增量按默认参数推送, 与展示结果不一致 — 忽略
    // (主图 BAR 实时更新不受影响)。
    if (wsIndicatorsDisabledRef.current) return;
    if (message.upper?.type === selected.upper) {
      // 2026-08-05：触屏切换副图触发的 WS 重订阅, 后端会重推全量 upper —
      // 抑制这一次（一次性）, 避免叠加指标被历史首点 update 拉回起点重绘;
      // 设置面板入口不抑制, 保持原行为。实时增量（最新一根）不受影响。
      if (suppressUpperRef.current) {
        suppressUpperRef.current = false;
      } else {
        applyIndicatorDelta(overlaySeriesRef.current, message.upper.result);
        if (selected.upper === UPPER_TECH.IKH) {
          ichimokuPrimRef.current?.applyDelta(
            message.upper.result, barsRef.current, selected.interval <= 2,
          );
        }
      }
    }
    message.lower.forEach((update) => {
      // 2026-07-30：key=tech 直接取，不再 indexOf 推算 paneIndex（位置无关）
      const seriesList = paneSeriesMapRef.current?.get(update.type) ?? [];
      applyIndicatorDelta(seriesList, update.result, update.type, update.type);
    });
  };

  // ---- 加载叠加指标 ----
  // 2026-07-21 22:49:10：页面打开即建立单一连接，卸载 iframe 时主动取消订阅并关闭。
  useEffect(() => {
    const client = new MarketSocket({
      onBar: handleRealtimeBar,
      onIndicators: handleRealtimeIndicators,
      // 2026-08-05：断线重连成功后重拉 REST 全量数据 — 补齐断线期间丢失的 K 线
      // (WS 增量只推最新点, 无法回溯空洞) 与指标数据 (自定义参数时 WS 增量被忽略)。
      onReconnect: () => { void refreshAllRef.current?.(); },
    });
    socketRef.current = client;
    client.subscribe({
      code: deps.code, interval: deps.interval, upper: deps.upper, lower: deps.lower,
    });
    return () => {
      client.dispose();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2026-08-05：代码/周期/指标变化 → 重新订阅（不重建连接）
  useEffect(() => {
    socketRef.current?.subscribe({
      code: deps.code, interval: deps.interval, upper: deps.upper, lower: deps.lower,
    });
  }, [deps.code, deps.interval, deps.upper, deps.lower]);

  // 注：fullscreenRef 在此 hook 内未直接使用，但保留入参以备未来扩展
  void fullscreenRef;

  return {
    setLiveSelection: (sel) => { liveSelectionRef.current = sel; },
  };
}
