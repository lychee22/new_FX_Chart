// 横屏全屏 hook: 封装 iOS Safari / Quark / WebView 兼容的"原生全屏 + 失败降级横屏兜底"逻辑。
// 供图表类组件复用 — 把返回的 wrapRef 挂在图表容器上, 调用 enterLandscape / exitLandscape
// 即可进入/退出横屏观看, isFullscreen 驱动外围 UI 隐藏, 物理旋转自动进出已内置。
// 逻辑自 MobileLayout 内联实现原样搬移 (2026-08-07 状态, 含 Quark 退出重试 / 竖屏驻留防抖)。

import { useCallback, useEffect, useRef, useState } from 'react';

// 全屏 / 横屏辅助: 兼容 webkit 前缀 (旧版 iOS/Android), 所有操作 best-effort + 静默降级
// iframe 内 screen.orientation.lock 会失败 → 优雅退化为竖屏全屏; iOS Safari 无 lock API → 可选链 no-op
type FsDoc = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
};

const isFullscreenElement = (): boolean => {
  const d = document as FsDoc;
  return !!(document.fullscreenElement || d.webkitFullscreenElement);
};

const requestElementFullscreen = (el: HTMLElement): Promise<void> => {
  type FsEl = HTMLElement & {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  };
  const e = el as FsEl;
  const fn = e.requestFullscreen ?? e.webkitRequestFullscreen;
  if (fn) return Promise.resolve(fn.call(e));
  const docEl = document.documentElement as FsEl;
  const fn2 = docEl.requestFullscreen ?? docEl.webkitRequestFullscreen;
  if (fn2) return Promise.resolve(fn2.call(docEl));
  return Promise.resolve(); // 无全屏支持 → lock 尝试单独失败也无害
};

// Quark/WebView may leave exitFullscreen pending forever; retry the native
// exit (standard API first, webkit prefix as fallback) until the fullscreen
// element is actually cleared.
const exitNativeFullscreen = async (): Promise<void> => {
  const d = document as FsDoc;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (!isFullscreenElement()) return;
    const fn =
      attempt === 0 && d.exitFullscreen
        ? d.exitFullscreen
        : d.webkitExitFullscreen ?? d.exitFullscreen;
    if (!fn) return;
    try {
      await Promise.race([
        Promise.resolve(fn.call(d)),
        new Promise<void>((resolve) => window.setTimeout(resolve, 200)),
      ]);
    } catch { /* keep retrying */ }
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
  }
};

// 视口是否已处于横屏: 以宽高比为准 (iOS Safari 的 screen.orientation 可能不更新),
// orientation API 仅作为拿不到可靠宽高比时的兜底。
const isLandscapeViewport = (): boolean => {
  if (window.innerWidth > window.innerHeight) return true;
  const ori = (screen as { orientation?: { type?: string } }).orientation?.type;
  return !!ori && ori.startsWith('landscape');
};

// 图表区横屏观看: 仅对 wrapRef 对应元素调用 requestFullscreen,
// 组件通过 isFullscreen 隐藏 TopBar / Tabs / 工具栏 / 免责声明。
// fullscreenchange 是 isFullscreen 的唯一事实来源: 覆盖所有退出路径
// (系统手势下滑 / Esc / iOS 浏览器 UI / 宿主程序退出)。
export function useLandscapeFullscreen() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(() => isFullscreenElement());
  // Ignore late fullscreenchange events while an exit is in progress (Quark/WebView quirk).
  const exitSuppressRef = useRef(false);
  // 串行化进入流程, 防止 requestFullscreen 在途时重复进入
  const landscapeBusyRef = useRef(false);
  const landscapeExitBusyRef = useRef(false);
  // 竖屏切换防抖定时器: 等待 Quark 瞬时竖屏事件落定后再退出
  const portraitDwellTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onChange = () => {
      const isFs = isFullscreenElement();
      if (isFs && exitSuppressRef.current) {
        console.log('[landscape-debug] fullscreenchange ignored (exit in progress)');
        return;
      }
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // 2026-08-03：组件卸载时主动退出全屏 (导航离开 mid-fullscreen 时防残留)
  useEffect(() => {
    return () => {
      if (portraitDwellTimerRef.current !== null) {
        window.clearTimeout(portraitDwellTimerRef.current);
        portraitDwellTimerRef.current = null;
      }
      if (isFullscreenElement()) {
        void exitNativeFullscreen();
      }
    };
  }, []);

  // 2026-08-07：原生全屏/锁屏不可用时不再用 CSS 旋转图表 —
  // rotate(90deg) 会把图表内容整体转过去, x/y 轴错位; 改为进入全屏态并提示物理旋转设备。
  // 真机调研 (vivo 原生 / 夸克 / 部分 WebView) 发现: lock 调用不抛错也不旋转,
  // 且 screen.orientation.type 不会更新, 需要靠宽高比判断真实横屏。
  const enterLandscape = useCallback(async () => {
    if (landscapeBusyRef.current) return;
    const el = wrapRef.current;
    if (!el) return;
    landscapeBusyRef.current = true;
    exitSuppressRef.current = false;
    if (portraitDwellTimerRef.current !== null) {
      window.clearTimeout(portraitDwellTimerRef.current);
      portraitDwellTimerRef.current = null;
    }
    console.log('[landscape-debug] enterLandscape called', {
      isFs: isFullscreenElement(),
      oriType: (screen as { orientation?: { type?: string } }).orientation?.type,
    });
    try {
      // 1) requestFullscreen — best effort, 失败也进入全屏态等待物理旋转
      if (!isFullscreenElement()) {
        try {
          await Promise.race([
            requestElementFullscreen(el),
            new Promise<never>((_, reject) =>
              window.setTimeout(() => reject(new Error('requestFullscreen timeout')), 300),
            ),
          ]);
          console.log('[landscape-debug] requestFullscreen resolved');
        } catch (e) {
          console.log('[landscape-debug] requestFullscreen rejected/timeout', e);
        }
      }
      // 2) orientation.lock — fire-and-forget, 静默失败
      try {
        const ori = (screen as { orientation?: { lock?: (o: string) => Promise<void>; type?: string } }).orientation;
        const p = ori?.lock?.('landscape');
        if (p && typeof (p as Promise<void>).then === 'function') {
          (p as Promise<void>).then(
            () => console.log('[landscape-debug] orientation.lock resolved, type=', ori?.type),
            (e: unknown) => console.log('[landscape-debug] orientation.lock rejected', e),
          );
        } else {
          console.log('[landscape-debug] orientation.lock API not available');
        }
      } catch (e) {
        console.log('[landscape-debug] orientation.lock threw', e);
      }
      // 3) Activate fullscreen UI immediately instead of waiting for lock.
      // The chart itself is never CSS-rotated: a 90deg transform would swap
      // x/y axes, so portrait devices get a rotate hint until the user
      // physically rotates to a landscape viewport.
      // 只要发起过横屏就进入全屏 UI; 原生全屏/锁屏未把视口切到横屏时,
      // 由 .mobile-rotate-hint 常驻提示用户手动旋转, 旋转成功后 media query 自动隐藏。
      setIsFullscreen(true);
      console.log('[landscape-debug] entered fullscreen, isLandscape =', isLandscapeViewport());
    } finally {
      landscapeBusyRef.current = false;
    }
  }, []);

  const exitLandscape = useCallback(async () => {
    if (landscapeExitBusyRef.current) return;
    landscapeExitBusyRef.current = true;
    // Ignore late fullscreenchange events while the native exit is in flight.
    exitSuppressRef.current = true;
    if (portraitDwellTimerRef.current !== null) {
      window.clearTimeout(portraitDwellTimerRef.current);
      portraitDwellTimerRef.current = null;
    }
    try {
      await exitNativeFullscreen();
      // Spec: exiting fullscreen releases the lock; unlock() is a no-op when not locked.
      try { (screen as { orientation?: { unlock?: () => void } }).orientation?.unlock?.(); } catch { /* ignore */ }
      console.log('[landscape-debug] exitLandscape -> fullscreen cleared');
    } finally {
      setIsFullscreen(false);
      landscapeExitBusyRef.current = false;
    }
  }, []);

  // 顶部栏全屏按钮仍走此处
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) void exitLandscape();
    else void enterLandscape();
  }, [isFullscreen, enterLandscape, exitLandscape]);

  // 2026-08-03：物理旋转自动进入/退出横屏 — 手动旋转为横屏时自动 requestFullscreen,
  // 转回竖屏自动退出。跨源 iframe / iOS 无 orientation API 时不派发事件 → 静默降级为仅按钮+轻点入口。
  // 2026-08-05：用户物理旋转到横屏时, 以真实横屏视口展示。
  useEffect(() => {
    const onOrientationChange = () => {
      if (isLandscapeViewport()) {
        // While an exit is in flight, Quark may report landscape again right
        // after the portrait transition; ignore it so we do not re-enter.
        if (exitSuppressRef.current) {
          console.log('[landscape-debug] landscape change ignored (exit in progress)');
          return;
        }
        console.log('[landscape-debug] physical landscape detected');
        if (!isFullscreen) void enterLandscape();
      } else {
        // Wait for Quark's transient portrait event to settle before acting;
        // otherwise exiting landscape can loop portrait-fullscreen -> exit -> enter.
        if (portraitDwellTimerRef.current !== null) {
          window.clearTimeout(portraitDwellTimerRef.current);
        }
        portraitDwellTimerRef.current = window.setTimeout(() => {
          portraitDwellTimerRef.current = null;
          if (landscapeExitBusyRef.current) return;
          if (isLandscapeViewport()) return;
          exitSuppressRef.current = false;
          if (isFullscreen) void exitLandscape();
        }, 1500);
      }
    };
    const ori = (screen as { orientation?: ScreenOrientation }).orientation;
    if (ori && typeof ori.addEventListener === 'function') {
      ori.addEventListener('change', onOrientationChange);
      window.addEventListener('orientationchange', onOrientationChange);
    }
    return () => {
      if (portraitDwellTimerRef.current !== null) {
        window.clearTimeout(portraitDwellTimerRef.current);
        portraitDwellTimerRef.current = null;
      }
      if (ori && typeof ori.removeEventListener === 'function') {
        ori.removeEventListener('change', onOrientationChange);
      }
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, [isFullscreen, enterLandscape, exitLandscape]);

  return { wrapRef, isFullscreen, enterLandscape, exitLandscape, toggleFullscreen };
}
