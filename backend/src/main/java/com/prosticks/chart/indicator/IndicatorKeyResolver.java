package com.prosticks.chart.indicator;

import com.prosticks.chart.model.ChartConstants;

import java.util.HashMap;
import java.util.Map;

/**
 * 指标类型 ID → 字符串键 解析器。
 *
 * <p>由于叠加指标 (UPPER_*) 与副图指标 (LOWER_*) 的数字常量范围重叠 (1-8),
 * 需要同时传入 pane 信息来消歧。前端调用时传 {@code pane=upper/lower} + {@code type=ID}。
 */
public final class IndicatorKeyResolver {

	private static final Map<String, String> UPPER = new HashMap<>();
	private static final Map<String, String> LOWER = new HashMap<>();

	static {
		UPPER.put("upper:" + ChartConstants.UPPER_SMA,  "SMA");
		UPPER.put("upper:" + ChartConstants.UPPER_EMA,  "EMA");
		UPPER.put("upper:" + ChartConstants.UPPER_WMA,  "WMA");
		UPPER.put("upper:" + ChartConstants.UPPER_BOLL, "BOLL");
		UPPER.put("upper:" + ChartConstants.UPPER_SAR,  "SAR");
		UPPER.put("upper:" + ChartConstants.UPPER_IKH,  "IKH");
		UPPER.put("upper:" + ChartConstants.UPPER_MAE,  "MAE");
		UPPER.put("upper:" + ChartConstants.UPPER_KC,   "KC");

		LOWER.put("lower:" + ChartConstants.LOWER_VOLUME, "VOLUME");
		LOWER.put("lower:" + ChartConstants.LOWER_RSI,    "RSI");
		LOWER.put("lower:" + ChartConstants.LOWER_MACD,   "MACD");
		LOWER.put("lower:" + ChartConstants.LOWER_STC,    "STC");
		LOWER.put("lower:" + ChartConstants.LOWER_MOM,    "MOM");
		LOWER.put("lower:" + ChartConstants.LOWER_PCTR,   "PCTR");
		LOWER.put("lower:" + ChartConstants.LOWER_OBV,    "OBV");
		LOWER.put("lower:" + ChartConstants.LOWER_MC,     "MC");
		LOWER.put("lower:" + ChartConstants.LOWER_ROC,    "ROC");
		LOWER.put("lower:" + ChartConstants.LOWER_ADX,    "ADX");
		LOWER.put("lower:" + ChartConstants.LOWER_MFI,    "MFI");
		LOWER.put("lower:" + ChartConstants.LOWER_VOLA,   "VOLA");
		LOWER.put("lower:" + ChartConstants.LOWER_VOLP,   "VOLP");
		LOWER.put("lower:" + ChartConstants.LOWER_VAO,    "VAO");
		LOWER.put("lower:" + ChartConstants.LOWER_CCI,    "CCI");
		LOWER.put("lower:" + ChartConstants.LOWER_ATR,    "ATR");
	}

	/**
	 * @param pane "upper" / "lower"
	 * @param type 指标数字 ID
	 * @return 指标字符串键, 找不到返回 null
	 */
	public static String resolve(String pane, int type) {
		String key = pane + ":" + type;
		String upper = UPPER.get(key);
		if (upper != null) return upper;
		return LOWER.get(key);
	}

	private IndicatorKeyResolver() {}
}
