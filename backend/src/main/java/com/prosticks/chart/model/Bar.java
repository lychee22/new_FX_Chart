package com.prosticks.chart.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 一根 K 线数据,完整对齐旧系统 {@code loadData()} 的 bar 字段结构。
 *
 * <p>除标准 OHLCV 外,还包含 Prosticks 专属字段:
 * <ul>
 *   <li>{@code mp} 模态点 (Modal Point, 最常成交价)</li>
 *   <li>{@code mc} 模态量 (Modal Count, mp 处成交量)</li>
 *   <li>{@code vap/vam} 成交密集点上下沿 → 活跃区矩形</li>
 *   <li>{@code ut/lt} 上下活跃区阈值 → 极端尾 (Extreme Tail)</li>
 *   <li>{@code mclose/popen/pclose} 模态收盘与衍生值</li>
 *   <li>{@code impmp} 重要模态点标记</li>
 * </ul>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Bar {

	/** 时间戳,格式 YYYYMMDDHHMM (与旧系统一致) */
	public long dt;
	/** 本地时间字符串 (对齐旧系统 localtime 字段) */
	public String localtime;

	// 标准 OHLCV
	public double o, h, l, c, v;

	// Prosticks 专属
	public double vap;   // 成交密集点上沿
	public double vam;   // 成交密集点下沿
	public double mp;    // 模态点 Modal Point
	public int    mc;    // 模态量 Modal Count
	public double ut;    // 上活跃区阈值 (极端尾)
	public double lt;    // 下活跃区阈值 (极端尾)

	// 衍生值
	public double mclose;   // (o+h+l+c)/4
	public double popen;
	public double pclose;
	public boolean impmp;   // 重要模态点

	// Lightweight Charts 前端需要 Unix 秒时间戳; 仅在序列化时由 service 填充
	public long time;

	public Bar() {}

	/** 由时间戳字符串构造并立即计算衍生字段 (对齐旧系统 loadData 的循环体)。 */
	public Bar(long dt, double o, double h, double l, double c, double v,
			   double vap, double vam, double mp, int mc, double ut, double lt) {
		this.dt = dt;
		this.localtime = String.valueOf(dt);
		this.o = o; this.h = h; this.l = l; this.c = c; this.v = v;
		this.vap = vap; this.vam = vam;
		this.mp = mp; this.mc = mc;
		this.ut = ut; this.lt = lt;
		this.mclose = (o + h + l + c) / 4.0;
		this.pclose = (mp > 0) ? (mp + h + l) / 3.0 : (h + l) / 2.0;
	}

	@Override
	public String toString() {
		return "Bar{dt=" + dt + ", o=" + o + ", h=" + h + ", l=" + l + ", c=" + c
				+ ", mp=" + mp + ", mc=" + mc + '}';
	}
}
