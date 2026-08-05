package com.prosticks.chart.model;

/**
 * 图表常量定义 —— 完整对齐旧系统 {@code simplechart.js} 顶部的数值常量。
 *
 * <p>数值必须与前端 / 旧 HTML 的 {@code <option value=...>} 保持一致,
 * 因为前端下拉值直接作为参数传给后端 API。
 */
public final class ChartConstants {

	private ChartConstants() {}

	// ---------------- 图表类型 Chart Types ----------------
	public static final int TYPE_PROSTICKS          = 0;
	public static final int TYPE_PROSTICKS_VOL      = 1;
	public static final int TYPE_BAR                = 2;  // 旧菜单 3
	public static final int TYPE_BAR_MODAL          = 3;  // 旧菜单 5
	public static final int TYPE_CANDLE             = 4;  // 旧菜单 2
	public static final int TYPE_MODAL_LINE         = 5;  // 旧菜单 6
	public static final int TYPE_LINE               = 6;  // 旧菜单 4
	public static final int TYPE_AREA               = 7;

	// ---------------- 时间周期 Intervals ----------------
	public static final int INTERVAL_DAY            = 0;
	public static final int INTERVAL_WEEK           = 1;
	public static final int INTERVAL_MONTH          = 2;
	public static final int INTERVAL_MIN            = 3;
	public static final int INTERVAL_5MIN           = 4;
	public static final int INTERVAL_10MIN          = 5;
	public static final int INTERVAL_15MIN          = 6;
	public static final int INTERVAL_30MIN          = 7;
	public static final int INTERVAL_HOUR           = 8;
	public static final int INTERVAL_2HOUR          = 9;
	public static final int INTERVAL_4HOUR          = 10;

	// ---------------- 叠加指标 Upper (Overlay) Tech ----------------
	public static final int UPPER_NONE      = 0;
	public static final int UPPER_SMA       = 1;
	public static final int UPPER_BOLL      = 2;
	public static final int UPPER_EMA       = 3;
	public static final int UPPER_SAR       = 4;
	public static final int UPPER_IKH       = 5;
	public static final int UPPER_WMA       = 6;
	public static final int UPPER_MAE       = 7;
	public static final int UPPER_KC        = 8;

	// ---------------- 副图指标 Lower Tech ----------------
	public static final int LOWER_NONE      = 0;
	public static final int LOWER_VOLUME    = 1;
	public static final int LOWER_RSI       = 2;
	public static final int LOWER_MACD      = 3;
	public static final int LOWER_STC       = 4;  // Stochastic
	public static final int LOWER_MOM       = 5;  // Momentum
	public static final int LOWER_PCTR      = 6;  // PercentageR / Williams %R
	public static final int LOWER_OBV       = 7;
	public static final int LOWER_MC        = 8;  // Modal Count
	public static final int LOWER_ROC       = 9;
	public static final int LOWER_ADX       = 10;
	public static final int LOWER_MFI       = 11;
	public static final int LOWER_VOLA      = 12;
	public static final int LOWER_VOLP      = 13;
	public static final int LOWER_VAO       = 14;
	public static final int LOWER_CCI       = 15;
	public static final int LOWER_ATR       = 16;

	// ---------------- 计算方式 (日线用模态点, 日内用收盘价) ----------------
	public static final int CALC_BY_LAST    = 0;
	public static final int CALC_BY_MP      = 1;
}
