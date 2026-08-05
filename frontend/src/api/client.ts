import axios from 'axios';
import type { Bar, Instrument, SupportResist, IndicatorResult } from '../types';

// axios 实例: baseURL 使用相对路径, 开发期由 Vite 代理转发到后端
const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const marketApi = {
  /** 获取全部交易品种 */
  getInstruments: () =>
    http.get<Instrument[]>('/meta/instruments').then((r) => r.data),

  /** 获取 K 线序列 */
  getBars: (code: string, interval: number, count = 300, shift = true) =>
    http
      .get<Bar[]>('/bars', { params: { code, interval, count, shift } })
      .then((r) => r.data),

  /** 获取支撑/阻力/模态点 */
  getSupportResist: (code: string, interval: number) =>
    http
      .get<SupportResist>('/support-resist', { params: { code, interval } })
      .then((r) => r.data),
};

export const indicatorApi = {
  /** 计算技术指标 */
  calculate: (
    pane: 'upper' | 'lower',
    type: number,
    code: string,
    interval: number,
    params?: string,
    shift = false,
  ) =>
    http
      .get<IndicatorResult>('/indicators', {
        // 2026-07-21 17:26:43：Ichimoku 需要未来空白时间点承载旧项目的 22 根前移数据。
        params: { pane, type, code, interval, params, shift },
      })
      .then((r) => r.data),
};

export default http;
